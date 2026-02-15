<script lang="ts">
	import type { GameRoomWithDetails } from '$lib/types/game';
	import RoomStatusBadge from './RoomStatusBadge.svelte';
	interface Props {
		room: GameRoomWithDetails;
	}

	let { room }: Props = $props();
</script>

<div class="mb-6 flex items-start justify-between">
	<div>
		<h1 class="text-3xl font-bold">{room.name}</h1>
		<p class="mt-1 text-sm text-muted-foreground">Créée par {room.owner.name}</p>
	</div>
	<RoomStatusBadge status={room.status} />
</div>
