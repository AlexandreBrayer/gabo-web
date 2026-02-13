<script lang="ts">
	import type { GameRoomWithDetails } from '$lib/types/game';

	interface Props {
		room: GameRoomWithDetails;
	}

	let { room }: Props = $props();
</script>

<div class="mb-6 flex items-start justify-between">
	<div>
		<h1 class="text-3xl font-bold text-gray-900">{room.name}</h1>
		<p class="mt-1 text-sm text-gray-500">Créée par {room.owner.name}</p>
	</div>
	<span
		class="rounded-full px-3 py-1 text-sm font-medium"
		class:bg-yellow-100={room.status === 'waiting'}
		class:text-yellow-800={room.status === 'waiting'}
		class:bg-green-100={room.status === 'playing'}
		class:text-green-800={room.status === 'playing'}
	>
		{room.status === 'waiting' ? 'En attente' : 'En cours'}
	</span>
</div>
