<script lang="ts">
	import { page } from '$app/state';
	import { getCurrentUser } from '$routes/auth.remote';
	import { getRoom } from '$routes/rooms/rooms.remote';
	import { redirect } from '@sveltejs/kit';
	import { source } from 'sveltekit-sse';
	import * as Card from '$lib/components/ui/card/index.js';
	import RoomHeader from '$lib/components/Room/RoomHeader.svelte';
	import RoomInfo from '$lib/components/Room/RoomInfo.svelte';
	import RoomActions from '$lib/components/Room/RoomActions.svelte';
	import PlayerList from '$lib/components/Room/PlayerList.svelte';
	import ChatPanel from '$lib/components/Chat/ChatPanel.svelte';
	import type { GameRoomWithDetails } from '$lib/types/game';
	import { SSEChannel } from '$lib/types/sse';

	const user = await getCurrentUser();

	if (!user) {
		redirect(307, '/login');
	}

	const roomId = page.params.id!;

	if (!roomId) {
		redirect(307, '/');
	}

	const roomQuery = getRoom(roomId);
	// Connexion SSE unique pour toute la page
	const connection = source(`/rooms/${roomId}/events`, {
		options: {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id })
		}
	});

	const roomUpdated = connection.select(SSEChannel.ROOM_UPDATED);
	const chatMessage = connection.select(SSEChannel.CHAT_MESSAGE);

	// Met à jour le cache de la query quand le SSE envoie une update
	$effect(() => {
		if ($roomUpdated) {
			const newRoomData = JSON.parse($roomUpdated) as GameRoomWithDetails;
			roomQuery.set(newRoomData);
		}
	});
</script>

<div class="grid gap-6 lg:grid-cols-12">
	<div class="lg:col-span-8">
		<Card.Root>
			<Card.Content>
				<RoomHeader {roomId} />
				<RoomInfo {roomId} />
				<RoomActions {roomId} />
			</Card.Content>
		</Card.Root>
	</div>

	<div class="lg:col-span-4">
		<PlayerList {roomId} />
		<ChatPanel {roomId} {chatMessage} />
	</div>
</div>
