<script lang="ts">
	import { page } from '$app/state';
	import { getCurrentUser } from '../../auth.remote';
	import { getRoom, joinRoom, leaveRoom, toggleReady, getChatHistory, sendMessage } from '../rooms.remote';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { source } from 'sveltekit-sse';
	import RoomHeader from '$lib/components/RoomHeader.svelte';
	import RoomInfo from '$lib/components/RoomInfo.svelte';
	import RoomActions from '$lib/components/RoomActions.svelte';
	import PlayerList from '$lib/components/PlayerList.svelte';
	import ChatPanel from '$lib/components/ChatPanel.svelte';

	const user = await getCurrentUser();

	if (!user) {
		redirect(307, '/login');
	}

	const roomId = page.params.id!;

	if (!roomId) {
		redirect(307, '/');
	}

	const room = $derived(await getRoom(roomId));
	const chatHistory = $derived(await getChatHistory(roomId));
	const reversedChat = $derived([...chatHistory].reverse());

	let chatContainer: HTMLDivElement;

	const isOwner = $derived(user && room.ownerId === user.id);
	const isParticipant = $derived(
		user && room.participants.some((p) => p.userId === user.id)
	);
	const currentParticipant = $derived(
		user ? room.participants.find((p) => p.userId === user.id) ?? null : null
	);
	const canStart = $derived(
		isOwner && room.participants.every((p) => p.isReady) && room.participants.length > 1
	);

	// Connexion SSE
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

	// Réagir aux événements
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

	$effect(() => {
		if ($chatMessage) {
			console.log('💬 New chat message, refreshing...');
			getChatHistory(roomId).refresh();
			
			// Scroll vers le bas quand un nouveau message arrive
			setTimeout(() => {
				if (chatContainer) {
					chatContainer.scrollTop = chatContainer.scrollHeight;
				}
			}, 100);
		}
	});

	async function handleJoin() {
		await joinRoom(roomId).updates(getRoom(roomId));
	}

	function handleLeave() {
		leaveRoom(roomId).then(() => {
			goto('/');
		});
	}

	function handleToggleReady() {
		if (!currentParticipant) return;
		toggleReady(roomId);
	}

	function handleStart() {
		//todo
	}

	async function handleSendMessage(message: string) {
		await sendMessage({ roomId, message });
		
		// Scroll vers le bas après l'envoi
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	function setChatContainer(node: HTMLDivElement) {
		chatContainer = node;
	}
</script>

<div class="mx-auto max-w-6xl p-4">
	<div class="mb-6">
		<a href="/" class="text-blue-600 hover:underline">← Retour à l'accueil</a>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Panneau principal -->
		<div class="lg:col-span-2">
			<div class="rounded-lg bg-white p-6 shadow-lg">
				<RoomHeader {room} />
				<RoomInfo {room} />
				<RoomActions
					{room}
					{isParticipant}
					{isOwner}
					{currentParticipant}
					{canStart}
					onJoin={handleJoin}
					onLeave={handleLeave}
					onToggleReady={handleToggleReady}
					onStart={handleStart}
				/>
			</div>
		</div>

		<!-- Sidebar - Liste des joueurs et chat -->
		<div class="lg:col-span-1">
			<PlayerList {room} />
			<ChatPanel
				messages={reversedChat}
				{isParticipant}
				onSendMessage={handleSendMessage}
				chatContainerRef={setChatContainer}
			/>
		</div>
	</div>
</div>
