<script lang="ts">
	import { page } from '$app/state';
	import { getRoom } from '$routes/rooms/rooms.remote';
	import { source } from 'sveltekit-sse';
	import type { GameRoomWithDetails } from '$lib/types/room';
	import { SSEChannel } from '$lib/types/sse';

	const roomId = page.params.id!;

	const roomQuery = getRoom(roomId);
	const room = $derived(await roomQuery);

	// Connexion SSE pour spectateur
	const connection = source(`/rooms/${roomId}/events`, {
		options: {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: 'spectator' })
		}
	});

	const roomUpdated = connection.select(SSEChannel.ROOM_UPDATED);
	const chatMessage = connection.select(SSEChannel.CHAT_MESSAGE);
	const gameUpdate = connection.select(SSEChannel.ROOM_GAME_UPDATE);

	// Met à jour le cache de la room
	$effect(() => {
		if ($roomUpdated) {
			const newRoomData = JSON.parse($roomUpdated) as GameRoomWithDetails;
			roomQuery.set(newRoomData);
		}
	});

	// Gestion des updates de jeu
	$effect(() => {
		if ($gameUpdate) {
			const gameData = JSON.parse($gameUpdate);
			console.log('Game update:', gameData);
			// TODO: Mettre à jour l'état du jeu
		}
	});
</script>

<div class="text-center">
	<h1 class="text-4xl font-bold">Mode Spectateur</h1>
	<p class="mt-4 text-gray-500">Room: {room.name}</p>
	<p class="text-sm text-gray-400">Status: {room.status}</p>
</div>
