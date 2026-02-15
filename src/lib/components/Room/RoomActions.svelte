<script lang="ts">
	import { joinRoom, leaveRoom, toggleReady } from '$routes/rooms/rooms.remote';
	import { getCurrentUser } from '$routes/auth.remote';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import type { GameRoomWithDetails } from '$lib/types/game';
	interface Props {
		room: GameRoomWithDetails;
	}

	let { room }: Props = $props();

	const user = $derived(await getCurrentUser());
	const isOwner = $derived(user && room.ownerId === user.id);
	const isParticipant = $derived(user && room.participants.some((p) => p.userId === user.id));
	const currentParticipant = $derived(
		user ? (room.participants.find((p) => p.userId === user.id) ?? null) : null
	);
	const canStart = $derived(
		isOwner && room.participants.every((p) => p.isReady) && room.participants.length > 1
	);

	async function handleJoin() {
		await joinRoom(room.id);
	}

	function handleLeave() {
		leaveRoom(room.id).then(() => {
			goto('/');
		});
	}

	function handleToggleReady() {
		toggleReady(room.id);
	}

	function handleStart() {
		//todo
	}
</script>

<div class="flex gap-3">
	{#if !isParticipant}
		{#if room.participantCount < room.maxPlayers}
			<Button onclick={handleJoin}>Rejoindre la partie</Button>
		{:else}
			<Button disabled variant="secondary">Partie pleine</Button>
		{/if}
	{:else if room.status === 'waiting'}
		<Button
			onclick={handleToggleReady}
			variant={currentParticipant?.isReady ? 'outline' : 'default'}
		>
			{currentParticipant?.isReady ? 'Pas prêt' : 'Prêt !'}
		</Button>

		{#if isOwner}
			<Button onclick={handleStart} disabled={!canStart}>Démarrer la partie</Button>
		{/if}

		<Button onclick={handleLeave} variant="destructive">Quitter</Button>
	{/if}
</div>

{#if isOwner && room.status === 'waiting' && !canStart}
	<p class="mt-4 text-sm text-gray-500">
		{room.participants.length < 2
			? 'Au moins 2 joueurs sont nécessaires pour démarrer.'
			: 'Tous les joueurs doivent être prêts pour démarrer.'}
	</p>
{/if}
