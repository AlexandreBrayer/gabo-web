<script lang="ts">
	import { page } from '$app/state';
	import { getCurrentUser } from '../../auth.remote';
	import { getRoom, joinRoom, leaveRoom, toggleReady, getChatHistory, sendMessage } from '../rooms.remote';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { source } from 'sveltekit-sse';

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

	let messageText = $state('');
	let chatContainer: HTMLDivElement;

	const isOwner = $derived(user && room.ownerId === user.id);
	const isParticipant = $derived(
		user && room.participants.some((p) => p.userId === user.id)
	);
	const currentParticipant = $derived(
		user ? room.participants.find((p) => p.userId === user.id) : null
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

	async function handleSendMessage(e: Event) {
		e.preventDefault();
		if (!messageText.trim()) return;
		
		await sendMessage({ roomId, message: messageText.trim() });
		messageText = '';
		
		// Scroll vers le bas après l'envoi
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
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
				<div class="mb-6 flex items-start justify-between">
					<div>
						<h1 class="text-3xl font-bold text-gray-900">{room.name}</h1>
						<p class="mt-1 text-sm text-gray-500">Créée par {room.owner.name}</p>
					</div>
					<span
						class="rounded-full px-3 py-1 text-sm font-medium"
						class:bg-yellow-100={room.status === 'waiting'}
						class:text-yellow-800={room.status === 'waiting'}
						class:bg-green-100={room.status === 'playing'}
						class:text-green-800={room.status === 'playing'}
					>
						{room.status === 'waiting' ? 'En attente' : 'En cours'}
					</span>
				</div>

				<!-- Informations de la room -->
				<div class="mb-6 rounded-md bg-gray-50 p-4">
					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<p class="text-sm font-medium text-gray-500">Type</p>
							<p class="text-lg font-semibold text-gray-900">
								{room.isPublic ? 'Publique' : 'Privée'}
							</p>
							{#if room.code}
								<p class="mt-1 text-xs text-gray-600">Code: <code class="font-mono">{room.code}</code></p>
							{/if}
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500">Joueurs</p>
							<p class="text-lg font-semibold text-gray-900">
								{room.participantCount} / {room.maxPlayers}
							</p>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3">
					{#if !isParticipant}
						{#if room.participantCount < room.maxPlayers}
							<button
								onclick={handleJoin}
								class="rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
							>
								Rejoindre la partie
							</button>
						{:else}
							<button
								disabled
								class="rounded-md bg-gray-300 px-6 py-2 font-medium text-gray-500 cursor-not-allowed"
							>
								Partie pleine
							</button>
						{/if}
					{:else}
						{#if room.status === 'waiting'}
							<button
								onclick={handleToggleReady}
								class="rounded-md px-6 py-2 font-medium text-white transition"
								class:bg-green-600={!currentParticipant?.isReady}
								class:hover:bg-green-700={!currentParticipant?.isReady}
								class:bg-yellow-600={currentParticipant?.isReady}
								class:hover:bg-yellow-700={currentParticipant?.isReady}
							>
								{currentParticipant?.isReady ? 'Pas prêt' : 'Prêt !'}
							</button>

							{#if isOwner}
								<button
									onclick={handleStart}
									disabled={!canStart}
									class="rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Démarrer la partie
								</button>
							{/if}

							<button
								onclick={handleLeave}
								class="rounded-md bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700"
							>
								Quitter
							</button>
						{/if}
					{/if}
				</div>

				{#if isOwner && room.status === 'waiting' && !canStart}
					<p class="mt-4 text-sm text-gray-500">
						{room.participants.length < 2
							? 'Au moins 2 joueurs sont nécessaires pour démarrer.'
							: 'Tous les joueurs doivent être prêts pour démarrer.'}
					</p>
				{/if}
			</div>
		</div>

		<!-- Sidebar - Liste des joueurs -->
		<div class="lg:col-span-1">
			<div class="rounded-lg bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-xl font-bold text-gray-900">
					Joueurs ({room.participantCount})
				</h2>

				<div class="space-y-3">
					{#each room.participants as participant}
						<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-medium"
							>
								{participant.user.name.charAt(0).toUpperCase()}
							</div>
							<div class="flex-1">
								<p class="font-medium text-gray-900">
									{participant.user.name}
									{#if participant.userId === room.ownerId}
										<span class="text-xs text-yellow-600">👑 Hôte</span>
									{/if}
								</p>
								<p class="text-xs text-gray-500">{participant.user.email}</p>
							</div>
							{#if room.status === 'waiting'}
								<div>
									{#if participant.isReady}
										<span class="text-green-600 font-medium text-sm">✓ Prêt</span>
									{:else}
										<span class="text-gray-400 text-sm">En attente...</span>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Chat -->
			<div class="rounded-lg bg-white p-6 shadow-lg mt-6">
				<h2 class="mb-4 text-xl font-bold text-gray-900">Chat</h2>

				<!-- Messages -->
				<div bind:this={chatContainer} class="mb-4 max-h-64 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
					{#if reversedChat.length === 0}
						<p class="text-sm text-gray-500 text-center py-4">Aucun message pour le moment</p>
					{:else}
						{#each reversedChat as msg}
							<div class="text-sm">
								<span class="font-semibold text-blue-600">{msg.user.name}:</span>
								<span class="text-gray-900">{msg.message}</span>
								<span class="text-xs text-gray-400 ml-2">
									{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
								</span>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Formulaire d'envoi -->
				{#if isParticipant}
					<form onsubmit={handleSendMessage} class="flex gap-2">
						<input
							type="text"
							bind:value={messageText}
							placeholder="Votre message..."
							maxlength="500"
							class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						<button
							type="submit"
							disabled={!messageText.trim()}
							class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Envoyer
						</button>
					</form>
				{:else}
					<p class="text-sm text-gray-500 text-center">Rejoignez la room pour participer au chat</p>
				{/if}
			</div>
		</div>
	</div>
</div>
