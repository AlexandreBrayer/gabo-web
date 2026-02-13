<script lang="ts">
	import type { GameRoomWithDetails } from '$lib/types/game';

	interface Props {
		room: GameRoomWithDetails;
	}

	let { room }: Props = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow-lg">
	<h2 class="mb-4 text-xl font-bold text-gray-900">Joueurs ({room.participantCount})</h2>

	<div class="space-y-3">
		{#each room.participants as participant}
			<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-medium"
				>
					{participant.user.name.charAt(0).toUpperCase()}
				</div>
				<div class="flex-1">
					<p class="font-medium text-gray-900">
						{participant.user.name}
						{#if participant.userId === room.ownerId}
							<span class="text-xs text-yellow-600">👑 Hôte</span>
						{/if}
					</p>
					<p class="text-xs text-gray-500">{participant.user.email}</p>
				</div>
				{#if room.status === 'waiting'}
					<div>
						{#if participant.isReady}
							<span class="text-green-600 font-medium text-sm">✓ Prêt</span>
						{:else}
							<span class="text-gray-400 text-sm">En attente...</span>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
