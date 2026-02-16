<script lang="ts">
	import { page } from '$app/state';
	import { getCurrentUser } from '$routes/auth.remote';
	import { getRoom, deleteRoom } from '$routes/rooms/rooms.remote';
	import { redirect } from '@sveltejs/kit';
	import { source } from 'sveltekit-sse';
	import type { GameRoomWithDetails } from '$lib/types/room';
	import { SSEChannel } from '$lib/types/sse';
	import { goto } from '$app/navigation';

	const user = await getCurrentUser();

	if (!user) {
		redirect(307, '/login');
	}

	const roomId = page.params.id!;

	if (!roomId) {
		redirect(307, '/');
	}

	const roomQuery = getRoom(roomId);
	const room = $derived(await roomQuery);

	// Vérifier si l'utilisateur est le owner
	const isOwner = $derived(room.ownerId === user.id);

	// Connexion SSE pour le jeu
	const connection = source(`/rooms/${roomId}/events`, {
		options: {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id })
		}
	});

	const roomUpdated = connection.select(SSEChannel.ROOM_UPDATED);
	const chatMessage = connection.select(SSEChannel.CHAT_MESSAGE);
	const gameUpdate = connection.select(SSEChannel.ROOM_GAME_UPDATE);

	// Met à jour le cache de la room quand le SSE envoie une update
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
		}
	});

	// Fonction pour supprimer la room
	async function handleDeleteRoom() {
		if (!confirm('Êtes-vous sûr de vouloir supprimer la room ?')) {
			return;
		}

		try {
			await deleteRoom(roomId);
			goto('/');
		} catch (error) {
			console.error('Erreur lors de la suppression:', error);
			alert('Erreur lors de la suppression de la room');
		}
	}
</script>

<div class="text-center">
	<h1 class="text-4xl font-bold">Mode Joueur</h1>
	<p class="mt-4 text-gray-500">Room: {room.name}</p>
	<p class="text-sm text-gray-400">Status: {room.status}</p>
</div>

{#if isOwner}
	<button
		onclick={handleDeleteRoom}
		class="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors"
	>
		🗑️ Supprimer la room
	</button>
{/if}
