<script lang="ts">
	import PlayerAvatar from './PlayerAvatar.svelte';
	import type {GameRoomWithDetails} from '$lib/types/game';

	interface Props {
		room: GameRoomWithDetails;
	}

	let { room }: Props = $props();

	const statusLabel = $derived(
		room.status === 'waiting'
			? 'En attente'
			: room.status === 'playing'
				? 'En cours'
				: 'Terminée'
	);

	const isFull = $derived(room.participantCount >= room.maxPlayers);
</script>

<a
	href="/rooms/{room.id}"
	class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
>
	<div class="mb-3 flex items-start justify-between">
		<h3 class="text-lg font-semibold text-gray-900">{room.name}</h3>
		<span
			class="rounded-full px-2 py-1 text-xs font-medium"
			class:bg-yellow-100={room.status === 'waiting'}
			class:text-yellow-800={room.status === 'waiting'}
			class:bg-green-100={room.status === 'playing'}
			class:text-green-800={room.status === 'playing'}
			class:bg-gray-100={room.status === 'finished'}
			class:text-gray-800={room.status === 'finished'}
		>
			{statusLabel}
		</span>
	</div>

	<div class="mb-3 text-sm text-gray-600">
		<p>Créée par : {room.owner.name}</p>
		<p>
			Joueurs : {room.participantCount} / {room.maxPlayers}
		</p>
	</div>

	<div class="flex items-center gap-2">
		{#each room.participants.slice(0, 3) as participant}
			<PlayerAvatar name={participant.user.name} />
		{/each}
		{#if room.participants.length > 3}
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700"
			>
				+{room.participants.length - 3}
			</div>
		{/if}
	</div>

	{#if isFull}
		<p class="mt-3 text-sm text-red-600">Partie pleine</p>
	{/if}
</a>
