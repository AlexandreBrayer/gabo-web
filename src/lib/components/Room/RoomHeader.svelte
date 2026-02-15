<script lang="ts">
	import { getRoom } from '$routes/rooms/rooms.remote';
	import RoomStatusBadge from './RoomStatusBadge.svelte';
	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	const room = $derived(await getRoom(roomId));
</script>

<div class="mb-6 flex items-start justify-between">
	<div>
		<h1 class="text-3xl font-bold">{room.name}</h1>
		<p class="mt-1 text-sm text-muted-foreground">Créée par {room.owner.name}</p>
	</div>
	<RoomStatusBadge status={room.status} />
</div>
