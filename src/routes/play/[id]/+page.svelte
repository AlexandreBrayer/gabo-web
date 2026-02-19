<script lang="ts">
	import { page } from '$app/state';
	import { getCurrentUser } from '$routes/auth.remote';
	import { getRoom, deleteRoom } from '$routes/rooms/rooms.remote';
	import { redirect } from '@sveltejs/kit';
	import { source } from 'sveltekit-sse';
	import type { GameRoomWithDetails } from '$lib/types/room';
	import { SSEChannel } from '$lib/types/sse';
	import { goto } from '$app/navigation';
	import { getGameState } from '$routes/game/gameHandlers.remote';
	import GameBoard from '$lib/components/Game/GameBoard.svelte';
	import type { AnonymizedFullGameState } from '$lib/server/game';

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
	const gameStateQuery = getGameState(roomId);
	const gameState = $derived(await gameStateQuery);

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
			const gameData = JSON.parse($gameUpdate) as AnonymizedFullGameState;
			gameStateQuery.set(gameData);
		}
	});

	$inspect(gameState);

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

{#if roomId}
	<div class="h-[calc(100vh-112px)]">
		<GameBoard currentUserId={user.id} {roomId} />
	</div>
{:else}
	<p>Room introuvable.</p>
{/if}

{#if isOwner}
	<button
		onclick={handleDeleteRoom}
		class="fixed right-8 bottom-8 rounded-full bg-red-600 px-6 py-3 font-bold text-white shadow-lg transition-colors hover:bg-red-700"
	>
		🗑️ Supprimer la room
	</button>
{/if}
