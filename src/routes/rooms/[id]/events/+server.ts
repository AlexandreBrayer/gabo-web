import { produce } from 'sveltekit-sse';
import type { RequestEvent } from '@sveltejs/kit';
import {
	registerRoomEmitter,
	unregisterRoomEmitter,
	registerUserEmitter,
	unregisterUserEmitter
} from '$lib/server/sse.js';

export async function POST({ params, request }: RequestEvent) {
	const roomId = params.id;
	if (!roomId) {
		return new Response('Room ID required', { status: 400 });
	}

	const body = await request.json();
	const userId = body.userId;

	return produce(
		function start({ emit, lock }) {
			console.log(`User ${userId} connected to room ${roomId} SSE`);

			// Enregistrer l'émetteur pour cette room
			registerRoomEmitter(roomId, emit);
			if (userId) registerUserEmitter(roomId, userId, emit);

			// Envoyer un événement de connexion
			emit('connected', JSON.stringify({ userId, roomId }));

			// Fonction de nettoyage
			return function stop() {
				console.log(`User ${userId} disconnected from room ${roomId} SSE`);
				unregisterRoomEmitter(roomId, emit);
				if (userId) unregisterUserEmitter(roomId, userId, emit);
			};
		},
		{
			stop() {
				console.log('SSE connection closed');
			}
		}
	);
}
