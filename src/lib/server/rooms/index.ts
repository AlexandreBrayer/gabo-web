import { db } from '../db/index.js';
import { gameRoom, roomParticipant, chatMessage } from '../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { GameRoomWithDetails, ChatMessageWithUser } from '../../types/game.js';
import { error } from '@sveltejs/kit';
import { broadcastToRoom } from '../sse.js';

/**
 * Génère un code unique pour une room privée (6 caractères alphanumériques)
 */
function generateRoomCode(): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

/**
 * Crée une nouvelle game room
 */
export async function createGameRoom(
	userId: string,
	data: {
		name: string;
		isPublic: boolean;
		maxPlayers?: number;
	}
): Promise<GameRoomWithDetails> {
	const code = data.isPublic ? null : generateRoomCode();

	const [newRoom] = await db
		.insert(gameRoom)
		.values({
			name: data.name,
			isPublic: data.isPublic,
			code,
			maxPlayers: data.maxPlayers || 4,
			ownerId: userId,
			status: 'waiting'
		})
		.returning();

	// Ajouter automatiquement le créateur comme participant
	await db.insert(roomParticipant).values({
		roomId: newRoom.id,
		userId,
		isReady: false
	});

	return getRoomById(newRoom.id);
}

/**
 * Récupère une room avec tous ses détails
 */
export async function getRoomById(roomId: string): Promise<GameRoomWithDetails> {
	const room = await db.query.gameRoom.findFirst({
		where: eq(gameRoom.id, roomId),
		with: {
			owner: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true
				}
			},
			participants: {
				with: {
					user: {
						columns: {
							id: true,
							name: true,
							email: true,
							image: true
						}
					}
				}
			}
		}
	});

	if (!room) {
		throw error(404, 'Room not found');
	}

	return {
		...room,
		participantCount: room.participants.length
	};
}

/**
 * Liste les rooms publiques disponibles
 */
export async function listPublicRooms(): Promise<GameRoomWithDetails[]> {
	const rooms = await db.query.gameRoom.findMany({
		where: eq(gameRoom.isPublic, true),
		with: {
			owner: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true
				}
			},
			participants: {
				with: {
					user: {
						columns: {
							id: true,
							name: true,
							email: true,
							image: true
						}
					}
				}
			}
		},
		orderBy: [desc(gameRoom.createdAt)]
	});

	return rooms.map((room) => ({
		...room,
		participantCount: room.participants.length
	}));
}

/**
 * Rejoindre une room (par ID ou par code)
 */
export async function joinRoom(
	userId: string,
	roomIdOrCode: string
): Promise<GameRoomWithDetails> {
	// Chercher par ID ou par code
	const room = await db.query.gameRoom.findFirst({
		where: sql`${gameRoom.id} = ${roomIdOrCode} OR ${gameRoom.code} = ${roomIdOrCode}`,
		with: {
			participants: true
		}
	});

	if (!room) {
		throw error(404, 'Room not found');
	}

	if (room.participants.length >= room.maxPlayers) {
		throw error(400, 'Room is full');
	}

	// Vérifier si l'utilisateur est déjà dans la room
	const existingParticipant = room.participants.find((p) => p.userId === userId);
	if (existingParticipant) {
		return getRoomById(room.id);
	}

	// Ajouter le participant
	await db.insert(roomParticipant).values({
		roomId: room.id,
		userId,
		isReady: false
	});

	// Broadcaster l'événement
	broadcastToRoom(room.id, 'room:updated', { action: 'player_joined', userId });

	return getRoomById(room.id);
}

/**
 * Quitter une room
 */
export async function leaveRoom(userId: string, roomId: string): Promise<void> {
	const room = await getRoomById(roomId);

	// Si c'est le owner qui quitte, supprimer la room
	if (room.ownerId === userId) {
		await db.delete(gameRoom).where(eq(gameRoom.id, roomId));
		return;
	}

	// Sinon, retirer le participant
	await db
		.delete(roomParticipant)
		.where(and(eq(roomParticipant.roomId, roomId), eq(roomParticipant.userId, userId)));

	// Broadcaster l'événement
	broadcastToRoom(roomId, 'room:updated', { action: 'player_left', userId });
}

/**
 * Marquer un joueur comme prêt/pas prêt
 */
export async function togglePlayerReady(userId: string, roomId: string): Promise<boolean> {
	const participant = await db.query.roomParticipant.findFirst({
		where: and(eq(roomParticipant.roomId, roomId), eq(roomParticipant.userId, userId))
	});

	if (!participant) {
		throw error(404, 'Participant not found');
	}

	const newReadyState = !participant.isReady;

	await db
		.update(roomParticipant)
		.set({ isReady: newReadyState })
		.where(and(eq(roomParticipant.roomId, roomId), eq(roomParticipant.userId, userId)));

	// Broadcaster l'événement
	broadcastToRoom(roomId, 'player:ready', { userId, isReady: newReadyState });

	return newReadyState;
}

/**
 * Vérifier si tous les joueurs sont prêts
 */
export async function areAllPlayersReady(roomId: string): Promise<boolean> {
	const room = await getRoomById(roomId);
	return room.participants.length > 0 && room.participants.every((p) => p.isReady);
}

/**
 * Démarrer une partie
 */
export async function startGame(userId: string, roomId: string): Promise<void> {
	const room = await getRoomById(roomId);

	if (room.ownerId !== userId) {
		throw error(403, 'Only the room owner can start the game');
	}

	if (!(await areAllPlayersReady(roomId))) {
		throw error(400, 'All players must be ready');
	}

	await db.update(gameRoom).set({ status: 'playing' }).where(eq(gameRoom.id, roomId));

	// Broadcaster l'événement
	broadcastToRoom(roomId, 'game:started', { roomId });
}

/**
 * Envoyer un message de chat
 */
export async function sendChatMessage(
	userId: string,
	roomId: string,
	message: string
): Promise<ChatMessageWithUser> {
	// Vérifier que l'utilisateur est dans la room
	const participant = await db.query.roomParticipant.findFirst({
		where: and(eq(roomParticipant.roomId, roomId), eq(roomParticipant.userId, userId))
	});

	if (!participant) {
		throw error(403, 'You must be in the room to send messages');
	}

	const [newMessage] = await db
		.insert(chatMessage)
		.values({
			roomId,
			userId,
			message
		})
		.returning();

	const messageWithUser = await db.query.chatMessage.findFirst({
		where: eq(chatMessage.id, newMessage.id),
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					image: true
				}
			}
		}
	});

	if (!messageWithUser) {
		throw error(500, 'Failed to send message');
	}

	// Broadcaster le message
	broadcastToRoom(roomId, 'chat:message', messageWithUser);

	return messageWithUser;
}

/**
 * Récupérer l'historique des messages d'une room
 */
export async function getChatHistory(
	roomId: string,
	limit: number = 50
): Promise<ChatMessageWithUser[]> {
	return db.query.chatMessage.findMany({
		where: eq(chatMessage.roomId, roomId),
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					image: true
				}
			}
		},
		orderBy: [desc(chatMessage.createdAt)],
		limit
	});
}
