<script lang="ts">
	import { getRoom } from '$routes/rooms/rooms.remote';
	import Badge from '$lib/components/ui/badge/badge.svelte';
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
	<Badge
		variant="outline"
		class="px-4 py-1.5 {room.status === 'waiting'
			? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
			: 'border-green-500 text-green-600 dark:text-green-400'}"
	>
		{room.status === 'waiting' ? 'En attente' : 'En cours'}
	</Badge>
</div>
