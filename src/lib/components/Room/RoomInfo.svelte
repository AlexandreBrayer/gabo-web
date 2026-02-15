<script lang="ts">
	import { getRoom } from '$routes/rooms/rooms.remote';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	const room = $derived(await getRoom(roomId));
</script>

<div class="mb-6 rounded-lg border-1 bg-muted/50 p-6">
	<div class="grid gap-4 md:grid-cols-2">
		<div>
			<p class="text-sm font-medium text-muted-foreground">Type</p>
			<p class="text-lg font-semibold text-foreground">
				{room.isPublic ? 'Publique' : 'Privée'}
			</p>
			{#if room.code}
				<p class="mt-1 text-xs text-muted-foreground">Code: <code class="font-mono">{room.code}</code></p>
			{/if}
		</div>
		<div>
			<p class="text-sm font-medium text-muted-foreground">Joueurs</p>
			<p class="text-lg font-semibold text-foreground">
				{room.participantCount} / {room.maxPlayers}
			</p>
		</div>
	</div>
</div>
