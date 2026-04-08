// Gestion des Server-Sent Events par room
import { SSEChannel } from '../types/sse';

// Map pour stocker les émetteurs par room
const roomEmitters = new Map<string, Set<(event: string, data: string) => void>>();

// Map pour stocker les émetteurs par room+user
const userEmitters = new Map<string, Map<string, Set<(event: string, data: string) => void>>>();

/**
 * Enregistre un émetteur pour une room
 */
export function registerRoomEmitter(roomId: string, emit: (event: string, data: string) => void) {
	if (!roomEmitters.has(roomId)) {
		roomEmitters.set(roomId, new Set());
	}
	const emitters = roomEmitters.get(roomId)!;
	emitters.add(emit);
	
	console.log(`Emitter registered for room ${roomId} (total: ${emitters.size})`);
}

/**
 * Supprime un émetteur d'une room
 */
export function unregisterRoomEmitter(roomId: string, emit: (event: string, data: string) => void) {
	const emitters = roomEmitters.get(roomId);
	if (!emitters) return;
	
	emitters.delete(emit);
	if (emitters.size === 0) {
		roomEmitters.delete(roomId);
	}
	
	console.log(`Emitter unregistered from room ${roomId} (remaining: ${emitters.size})`);
}

/**
 * Broadcaster un événement à tous les clients d'une room
 */
export function broadcastToRoom(roomId: string, channel: SSEChannel, data: unknown) {
	const emitters = roomEmitters.get(roomId);
	if (!emitters || emitters.size === 0) {
		console.log(`No emitters for room ${roomId}, skipping broadcast`);
		return;
	}

	const payload = JSON.stringify(data);
	console.log(`Broadcasting ${channel} to ${emitters.size} clients in room ${roomId}`);
	
	for (const emit of emitters) {
		try {
			emit(channel, payload);
		} catch (error) {
			console.error('Error broadcasting event:', error);
		}
	}
}

export function broadcastGameUpdate(roomId: string, gameState: unknown) {
	broadcastToRoom(roomId, SSEChannel.ROOM_GAME_UPDATE, gameState);
}

/**
 * Enregistre un émetteur pour un utilisateur spécifique dans une room
 */
export function registerUserEmitter(
	roomId: string,
	userId: string,
	emit: (event: string, data: string) => void
) {
	if (!userEmitters.has(roomId)) {
		userEmitters.set(roomId, new Map());
	}
	const roomUsers = userEmitters.get(roomId)!;
	if (!roomUsers.has(userId)) {
		roomUsers.set(userId, new Set());
	}
	roomUsers.get(userId)!.add(emit);
}

/**
 * Supprime un émetteur utilisateur d'une room
 */
export function unregisterUserEmitter(
	roomId: string,
	userId: string,
	emit: (event: string, data: string) => void
) {
	const roomUsers = userEmitters.get(roomId);
	if (!roomUsers) return;
	const emitters = roomUsers.get(userId);
	if (!emitters) return;
	emitters.delete(emit);
	if (emitters.size === 0) roomUsers.delete(userId);
	if (roomUsers.size === 0) userEmitters.delete(roomId);
}

/**
 * Broadcaster un événement à un utilisateur spécifique
 */
export function broadcastToUser(
	roomId: string,
	userId: string,
	channel: SSEChannel,
	data: unknown
) {
	const emitters = userEmitters.get(roomId)?.get(userId);
	if (!emitters || emitters.size === 0) return;
	const payload = JSON.stringify(data);
	for (const emit of emitters) {
		try {
			emit(channel, payload);
		} catch (err) {
			console.error('Error broadcasting personal event:', err);
		}
	}
}

export function broadcastPersonalGameUpdate(roomId: string, userId: string, gameState: unknown) {
	broadcastToUser(roomId, userId, SSEChannel.PERSONAL_GAME_UPDATE, gameState);
}
