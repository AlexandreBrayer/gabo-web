<script lang="ts">
	import RoomCard from './RoomCard.svelte';
	import { getPublicRooms } from '$routes/rooms/rooms.remote';
	import { Button } from '$lib/components/ui/button/index';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
	const rooms = $derived(await getPublicRooms());

	function handleRefresh() {
		getPublicRooms().refresh();
	}
</script>

<div>
	<h2 class="mb-4 text-2xl font-bold">Parties publiques</h2>

	{#if rooms.length === 0}
		<div class="rounded-lg border-2 border-dashed p-12 text-center">
			<p>Aucune partie publique pour le moment.</p>
			<p class="mt-2 text-sm">Soyez le premier à en créer une !</p>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each rooms as room (room.id)}
				<RoomCard {room} />
			{/each}
		</div>
	{/if}

	<!-- Bouton refresh -->
	<Button class="mt-6" onclick={handleRefresh}>
		<RefreshCcw /> Actualiser
	</Button>
</div>
