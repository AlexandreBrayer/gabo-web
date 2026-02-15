<script lang="ts">
	import { page } from '$app/state';
	import { getCurrentUser } from '../../auth.remote';
	import { getRoom, getChatHistory } from '../rooms.remote';
	import { redirect } from '@sveltejs/kit';
	import { source } from 'sveltekit-sse';
	import * as Card from '$lib/components/ui/card/index.js';
	import RoomHeader from '$lib/components/Room/RoomHeader.svelte';
	import RoomInfo from '$lib/components/Room/RoomInfo.svelte';
	import RoomActions from '$lib/components/Room/RoomActions.svelte';
	import PlayerList from '$lib/components/Room/PlayerList.svelte';
	import ChatPanel from '$lib/components/Chat/ChatPanel.svelte';

	const user = await getCurrentUser();

	if (!user) {
		redirect(307, '/login');
	}

	const roomId = page.params.id!;

	if (!roomId) {
		redirect(307, '/');
	}

	// Connexion SSE unique pour toute la page
	const connection = source(`/rooms/${roomId}/events`, {
		options: {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id })
		}
	});

	const connectedEvent = connection.select('connected');
	const roomUpdated = connection.select('room:updated');
	const playerReady = connection.select('player:ready');
	const gameStarted = connection.select('game:started');
	const chatMessage = connection.select('chat:message');
	
	// Réagir aux événements SSE
	$effect(() => {
		if ($connectedEvent) {
			console.log('✅ SSE Connected:', $connectedEvent);
		}
	});

	$effect(() => {
		if ($roomUpdated || $playerReady || $gameStarted) {
			console.log('🔄 Room update, refreshing...');
			getRoom(roomId).refresh();
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
