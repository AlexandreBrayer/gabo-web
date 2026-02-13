/**
 * Remote Functions pour la gestion des Game Rooms
 * Placées dans la hiérarchie des routes pour respecter la convention SvelteKit
 */

import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { query, form, command } from '$app/server';
import {
	createGameRoom,
	getRoomById,
	listPublicRooms,
	joinRoom as joinRoomLogic,
	leaveRoom as leaveRoomLogic,
	togglePlayerReady,
	startGame as startGameLogic,
	sendChatMessage,
	getChatHistory as getChatHistoryLogic
} from '$lib/server/rooms';
import { getRequestEvent } from '$app/server';

/**
 * Récupérer la liste des rooms publiques
 */
export const getPublicRooms = query(async () => {
	return listPublicRooms();
});

/**
 * Récupérer les détails d'une room
 */
export const getRoom = query(v.string(), async (roomId) => {
	return getRoomById(roomId);
});

/**
 * Récupérer l'historique du chat d'une room
 */
export const getChatHistory = query(v.string(), async (roomId) => {
	return getChatHistoryLogic(roomId, 50);
});

/**
 * Récupérer les rooms de l'utilisateur connecté
 */
export const getMyRooms = query(async () => {
	const { locals } = getRequestEvent();
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const { db } = await import('$lib/server/db');
	const { roomParticipant } = await import('$lib/server/db/schema');
	const { eq } = await import('drizzle-orm');

	const rooms = await db.query.gameRoom.findMany({
		where: eq(roomParticipant.userId, userId),
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

	return rooms.map((room) => ({
		...room,
		participantCount: room.participants.length
	}));
});

/**
 * Créer une nouvelle game room
 */
export const createRoom = form(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty('Le nom de la room est requis')),
		privacy: v.picklist(['public', 'private'], 'Le type de partie doit être public ou private'),
		maxPlayers: v.optional(v.pipe(v.number(), v.minValue(2), v.maxValue(8)), 4)
	}),
	async (data) => {
		const { locals } = getRequestEvent();
		const userId = locals.user?.id;

		if (!userId) {
			throw error(401, 'Unauthorized');
		}

		// Convertir privacy en isPublic pour la DB
		const room = await createGameRoom(userId, {
			name: data.name,
			isPublic: data.privacy === 'public',
			maxPlayers: data.maxPlayers
		});

		// Rediriger vers la room créée
		redirect(303, `/rooms/${room.id}`);
	}
);

/**
 * Rejoindre une room (par ID ou code)
 */
export const joinRoom = command(v.string(), async (roomIdOrCode) => {
	const { locals } = getRequestEvent();
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	return joinRoomLogic(userId, roomIdOrCode);
});

/**
 * Quitter une room
 */
export const leaveRoom = command(v.string(), async (roomId) => {
	const { locals } = getRequestEvent();
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	await leaveRoomLogic(userId, roomId);
});

/**
 * Toggle l'état ready d'un joueur
 */
export const toggleReady = command(v.string(), async (roomId) => {
	const { locals } = getRequestEvent();
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	await togglePlayerReady(userId, roomId);
});

/**
 * Démarrer la partie (owner uniquement)
 */
export const startGame = command(v.string(), async (roomId) => {
	const { locals } = getRequestEvent();
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	await startGameLogic(userId, roomId);

	// Rafraîchir les données de la room
	await getRoom(roomId).refresh();
});

/**
 * Envoyer un message dans le chat
 */
export const sendMessage = command(
	v.object({
		roomId: v.string(),
		message: v.pipe(v.string(), v.nonEmpty(), v.maxLength(500))
	}),
	async (data) => {
		const { locals } = getRequestEvent();
		const userId = locals.user?.id;

		if (!userId) {
			throw error(401, 'Unauthorized');
		}

		const chatMessage = await sendChatMessage(userId, data.roomId, data.message);

		// Rafraîchir l'historique du chat
		await getChatHistory(data.roomId).refresh();

		return chatMessage;
	}
);
