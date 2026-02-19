<script lang="ts">
	import PlayableCard from './PlayableCard.svelte';
	import { GameStatus, type PlayableCard as PlayableCardType } from '$lib/types/game';
	import { getGameState } from '$routes/game/gameHandlers.remote';
	import { getCurrentUser } from '$routes/auth.remote';

	interface Props {
		roomId: string;
	}

	const user = await getCurrentUser();

	let { roomId }: Props = $props();
	const gameStateQuery = $derived(getGameState(roomId));
	const gameState = $derived(await gameStateQuery);

	const deck = $derived(gameState.game.deck);
	const pile = $derived(gameState.game.pile);
	const topCard = $derived(pile.length > 0 ? pile[pile.length - 1] : null);

	const currentPlayerId = $derived(gameState.game.currentPlayerId);
	const isCurrentUserTurn = $derived(currentPlayerId === user!.id);
	const isDrawPhase = $derived(gameState.game.status === GameStatus.DRAW_PHASE);
	const canDraw = $derived.by(() => {
		if (isCurrentUserTurn && isDrawPhase) {
			return true;
		}
		return false;
	});
</script>

<div class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4">
	<!-- Deck -->
	<div class="flex flex-col items-center gap-1">
		{#if deck.length > 0}
			<div class={canDraw ? 'rounded-lg border-2 border-yellow-400 p-1' : ''}>
				<PlayableCard card="unknown" size="sm" />
			</div>
		{:else}
			<div
				class="flex h-36 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-600"
			>
				<span class="text-xs text-gray-500">Vide</span>
			</div>
		{/if}
		<span class="text-xs text-gray-300">{deck.length}</span>
	</div>

	<!-- Pile -->
	<div class="flex flex-col items-center gap-1">
		{#if topCard}
			<div class={canDraw ? 'rounded-lg border-2 border-yellow-400 p-1' : 'p-1'}>
				<PlayableCard card={topCard} size="sm" />
			</div>
		{:else}
			<div
				class="flex h-36 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-600"
			>
				<span class="text-xs text-gray-500">Vide</span>
			</div>
		{/if}
		<span class="text-xs text-gray-300">Pile</span>
	</div>
</div>
