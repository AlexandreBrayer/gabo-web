<script lang="ts">
	import type { GameRoomWithDetails } from '$lib/types/game';

	interface Props {
		room: GameRoomWithDetails;
	}

	let { room }: Props = $props();
</script>

<div class="mb-6 rounded-md bg-gray-50 p-4">
	<div class="grid gap-4 md:grid-cols-2">
		<div>
			<p class="text-sm font-medium text-gray-500">Type</p>
			<p class="text-lg font-semibold text-gray-900">
				{room.isPublic ? 'Publique' : 'Privée'}
			</p>
			{#if room.code}
				<p class="mt-1 text-xs text-gray-600">Code: <code class="font-mono">{room.code}</code></p>
			{/if}
		</div>
		<div>
			<p class="text-sm font-medium text-gray-500">Joueurs</p>
			<p class="text-lg font-semibold text-gray-900">
				{room.participantCount} / {room.maxPlayers}
			</p>
		</div>
	</div>
</div>
