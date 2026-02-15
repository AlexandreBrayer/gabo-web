<script lang="ts">
	import { getRoom } from '$routes/rooms/rooms.remote';
	import * as Card from '$lib/components/ui/card/index.js';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	const room = $derived(await getRoom(roomId));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Joueurs ({room.participantCount})</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="space-y-3">
			{#each room.participants as participant}
				<div class="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-medium text-white"
					>
						{participant.user.name.charAt(0).toUpperCase()}
					</div>
					<div class="flex-1">
						<p class="font-medium">
							{participant.user.name}
							{#if participant.userId === room.ownerId}
								<span class="text-xs text-yellow-500">👑 Hôte</span>
							{/if}
						</p>
						<p class="text-xs text-gray-500">{participant.user.email}</p>
					</div>
					{#if room.status === 'waiting'}
						<div>
							{#if participant.isReady}
								<span class="text-sm font-medium text-green-600">✓ Prêt</span>
							{:else}
								<span class="text-sm text-yellow-400">En attente...</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
