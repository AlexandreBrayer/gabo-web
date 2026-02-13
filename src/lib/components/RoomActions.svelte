<script lang="ts">
	import type { GameRoomWithDetails } from '$lib/types/game';

	interface Props {
		room: GameRoomWithDetails;
		isParticipant: boolean;
		isOwner: boolean;
		currentParticipant: GameRoomWithDetails['participants'][0] | null;
		canStart: boolean;
		onJoin: () => void;
		onLeave: () => void;
		onToggleReady: () => void;
		onStart: () => void;
	}

	let {
		room,
		isParticipant,
		isOwner,
		currentParticipant,
		canStart,
		onJoin,
		onLeave,
		onToggleReady,
		onStart
	}: Props = $props();
</script>

<div class="flex gap-3">
	{#if !isParticipant}
		{#if room.participantCount < room.maxPlayers}
			<button
				onclick={onJoin}
				class="rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
			>
				Rejoindre la partie
			</button>
		{:else}
			<button
				disabled
				class="rounded-md bg-gray-300 px-6 py-2 font-medium text-gray-500 cursor-not-allowed"
			>
				Partie pleine
			</button>
		{/if}
	{:else}
		{#if room.status === 'waiting'}
			<button
				onclick={onToggleReady}
				class="rounded-md px-6 py-2 font-medium text-white transition"
				class:bg-green-600={!currentParticipant?.isReady}
				class:hover:bg-green-700={!currentParticipant?.isReady}
				class:bg-yellow-600={currentParticipant?.isReady}
				class:hover:bg-yellow-700={currentParticipant?.isReady}
			>
				{currentParticipant?.isReady ? 'Pas prêt' : 'Prêt !'}
			</button>

			{#if isOwner}
				<button
					onclick={onStart}
					disabled={!canStart}
					class="rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Démarrer la partie
				</button>
			{/if}

			<button
				onclick={onLeave}
				class="rounded-md bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700"
			>
				Quitter
			</button>
		{/if}
	{/if}
</div>

{#if isOwner && room.status === 'waiting' && !canStart}
	<p class="mt-4 text-sm text-gray-500">
		{room.participants.length < 2
			? 'Au moins 2 joueurs sont nécessaires pour démarrer.'
			: 'Tous les joueurs doivent être prêts pour démarrer.'}
	</p>
{/if}
