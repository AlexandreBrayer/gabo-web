// Gestion des Server-Sent Events par room

// Map pour stocker les émetteurs par room
const roomEmitters = new Map<string, Set<(event: string, data: string) => any>>();

/**
 * Enregistre un émetteur pour une room
 */
export function registerRoomEmitter(roomId: string, emit: (event: string, data: string) => any) {
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
export function unregisterRoomEmitter(roomId: string, emit: (event: string, data: string) => any) {
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
export function broadcastToRoom(roomId: string, event: string, data: any) {
	const emitters = roomEmitters.get(roomId);
	if (!emitters || emitters.size === 0) {
		console.log(`No emitters for room ${roomId}, skipping broadcast`);
		return;
	}

	const payload = JSON.stringify(data);
	console.log(`Broadcasting ${event} to ${emitters.size} clients in room ${roomId}`);
	
	for (const emit of emitters) {
		const { error } = emit(event, payload);
		if (error) {
			console.error('Error broadcasting event:', error);
		}
	}
}
