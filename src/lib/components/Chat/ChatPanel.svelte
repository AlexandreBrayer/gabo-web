<script lang="ts">
	import { getCurrentUser } from '$routes/auth.remote';
	import { getRoom, getChatHistory, sendMessage } from '$routes/rooms/rooms.remote';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import { untrack } from 'svelte';
	import type { Readable } from 'svelte/store';
	import type { ChatMessageWithUser } from '$lib/types/game';

	interface Props {
		roomId: string;
		chatMessage: Readable<string>;
	}

	let { roomId, chatMessage }: Props = $props();

	const [user, room, chatHistory] = $derived(
		await Promise.all([getCurrentUser(), getRoom(roomId), getChatHistory(roomId)])
	);
	
	// Messages reçus via SSE
	let receivedMessages = $state<ChatMessageWithUser[]>([]);
	
	// Combiner l'historique et les messages SSE, triés par date
	const chatMessages = $derived(
		[...chatHistory, ...receivedMessages].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		)
	);
	
	const isParticipant = $derived(user && room.participants.some((p) => p.userId === user.id));

	// Ajouter les nouveaux messages SSE
	$effect(() => {
		if (chatMessage && $chatMessage) {
			const decodedMessage = JSON.parse($chatMessage) as ChatMessageWithUser;
			receivedMessages = [...untrack(() => receivedMessages), decodedMessage];
		}
	});

	let chatContainer: HTMLDivElement;

	// Scroller en bas au chargement initial et quand de nouveaux messages arrivent
	$effect(() => {
		if (chatContainer && chatMessages.length > 0) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});

	let messageText = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!messageText.trim()) return;

		await sendMessage({ roomId, message: messageText.trim() });
		messageText = '';
	}
</script>

<Card.Root class="mt-6">
	<Card.Header>
		<Card.Title>Chat</Card.Title>
	</Card.Header>
	<Card.Content>
		<div
			bind:this={chatContainer}
			class="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-lg border bg-muted/50 p-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground [&::-webkit-scrollbar-track]:bg-muted"
		>
			{#if chatMessages.length == 0}
				<p class="py-4 text-center text-sm text-gray-500">Aucun message pour le moment</p>
			{:else}
				{#each chatMessages as msg}
					{#if msg && msg.user}
						<div class="text-sm">
							<span class="ml-2 text-xs text-gray-400">
								{new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</span>
							<span class="font-bold">{msg.user.name}:</span>
							<span class="">{msg.message}</span>
						</div>
					{/if}
				{/each}
			{/if}
		</div>

		{#if isParticipant}
			<form onsubmit={handleSubmit} class="flex gap-2">
				<Input
					type="text"
					bind:value={messageText}
					placeholder="Votre message..."
					maxlength={500}
					class="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
				/>
				<Button type="submit" disabled={!messageText.trim()}>Envoyer</Button>
			</form>
		{:else}
			<p class="text-center text-sm text-gray-500">Rejoignez la room pour participer au chat</p>
		{/if}
	</Card.Content>
</Card.Root>
