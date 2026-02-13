<script lang="ts">
	import type { ChatMessageWithUser } from '$lib/types/game';

	interface Props {
		messages: ChatMessageWithUser[];
		isParticipant: boolean;
		onSendMessage: (message: string) => void;
		chatContainerRef?: (node: HTMLDivElement) => void;
	}

	let { messages, isParticipant, onSendMessage, chatContainerRef }: Props = $props();

	let messageText = $state('');
	let chatContainer: HTMLDivElement;

	$effect(() => {
		if (chatContainerRef && chatContainer) {
			chatContainerRef(chatContainer);
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!messageText.trim()) return;

		onSendMessage(messageText.trim());
		messageText = '';
	}
</script>

<div class="rounded-lg bg-white p-6 shadow-lg mt-6">
	<h2 class="mb-4 text-xl font-bold text-gray-900">Chat</h2>

	<!-- Messages -->
	<div
		bind:this={chatContainer}
		class="mb-4 max-h-64 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3"
	>
		{#if messages.length === 0}
			<p class="text-sm text-gray-500 text-center py-4">Aucun message pour le moment</p>
		{:else}
			{#each messages as msg}
				<div class="text-sm">
					<span class="font-semibold text-blue-600">{msg.user.name}:</span>
					<span class="text-gray-900">{msg.message}</span>
					<span class="text-xs text-gray-400 ml-2">
						{new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
							hour: '2-digit',
							minute: '2-digit'
						})}
					</span>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Formulaire d'envoi -->
	{#if isParticipant}
		<form onsubmit={handleSubmit} class="flex gap-2">
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
