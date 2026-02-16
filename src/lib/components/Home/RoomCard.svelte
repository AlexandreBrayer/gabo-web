<script lang="ts">
	import PlayerAvatar from './PlayerAvatar.svelte';
	import type {GameRoomWithDetails} from '$lib/types/room';
    import * as Card from '$lib/components/ui/card/index.js';
	import RoomStatusBadge from '../Room/RoomStatusBadge.svelte';

	interface Props {
		room: GameRoomWithDetails;
	}

	let { room }: Props = $props();

	const isFull = $derived(room.participantCount >= room.maxPlayers);
</script>

<a href="/rooms/{room.id}">
	<Card.Root>
		<Card.Header>
			<div class="flex items-start justify-between">
				<Card.Title class="text-lg">{room.name}</Card.Title>
				<RoomStatusBadge status={room.status} />
			</div>
		</Card.Header>
		<Card.Content>
			<div class="mb-3 text-sm text-muted-foreground">
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
						class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
					>
						+{room.participants.length - 3}
					</div>
				{/if}
			</div>

			{#if isFull}
				<p class="mt-3 text-sm text-destructive">Partie pleine</p>
			{/if}
		</Card.Content>
	</Card.Root>
</a>
