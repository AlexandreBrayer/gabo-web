<script lang="ts">
	import PlayableCard from './PlayableCard.svelte';
	import { GameStatus } from '$lib/types/game';
	import { getMyGameState, drawDeck, drawPile, useEffect, discardCard } from '$routes/game/gameHandlers.remote';
	import { getCurrentUser } from '$routes/auth.remote';

	interface Props {
		roomId: string;
	}

	const user = await getCurrentUser();

	let { roomId }: Props = $props();
	const gameStateQuery = $derived(getMyGameState(roomId));
	const gameState = $derived(await gameStateQuery);

	const deck = $derived(gameState.game.deck);
	const pile = $derived(gameState.game.pile);
	const topCard = $derived(pile.length > 0 ? pile[pile.length - 1] : null);

	const currentPlayerId = $derived(gameState.game.currentPlayerId);
	const isCurrentUserTurn = $derived(currentPlayerId === user!.id);
	const isDrawPhase = $derived(gameState.game.status === GameStatus.DRAW_PHASE);
	const isActionPhase = $derived(gameState.game.status === GameStatus.ACTION_PHASE);
	const canDraw = $derived(isCurrentUserTurn && isDrawPhase);

	const handledCard = $derived.by(() => {
		const mat = gameState.mats.find((m) => m.userId === user!.id);
		return mat?.handledCard ?? null;
	});
	const handledCardSource = $derived.by(() => {
		const mat = gameState.mats.find((m) => m.userId === user!.id);
		return mat?.handledCardSource ?? null;
	});
	const showHandledCard = $derived(isCurrentUserTurn && isActionPhase && handledCard !== null);
	const canUseEffect = $derived(handledCardSource === 'deck');
	const canDiscard = $derived(handledCardSource !== null);
</script>

<div class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4">
	<!-- Deck -->
	<div class="flex flex-col items-center gap-1">
		{#if deck.length > 0}
			<button
				class={canDraw
					? 'cursor-pointer rounded-lg border-2 border-yellow-400 p-1 transition-transform hover:scale-105'
					: 'cursor-default rounded-lg p-1'}
				disabled={!canDraw}
				onclick={() => drawDeck(roomId)}
			>
				<PlayableCard card="unknown" size="sm" />
			</button>
		{:else}
			<div
				class="flex h-36 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-600"
			>
				<span class="text-xs text-gray-300">Vide</span>
			</div>
		{/if}
		<span class="text-xs text-gray-300">{deck.length}</span>
	</div>

	<!-- Carte piochée -->
	{#if showHandledCard}
		<div class="flex flex-col items-center gap-2">
			<div class="rounded-lg border-2 border-blue-400 p-1">
				<PlayableCard card={handledCard!} size="sm" />
			</div>
			<span class="text-xs text-blue-300">En main</span>
			{#if canUseEffect}
				<button
					class="rounded bg-purple-600 px-2 py-1 text-xs text-white transition-colors hover:bg-purple-700"
					onclick={() => useEffect(roomId)}
				>
					Utiliser l'effet
				</button>
			{/if}
			{#if canDiscard}
				<button
					class="rounded bg-gray-600 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-700"
					onclick={() => discardCard(roomId)}
				>
					Défausser
				</button>
			{/if}
		</div>
	{/if}

	<!-- Pile -->
	<div class="flex flex-col items-center gap-1">
		{#if topCard}
			<button
				class={canDraw
					? 'cursor-pointer rounded-lg border-2 border-yellow-400 p-1 transition-transform hover:scale-105'
					: 'cursor-default rounded-lg p-1'}
				disabled={!canDraw}
				onclick={() => drawPile(roomId)}
			>
				<PlayableCard card={topCard} size="sm" />
			</button>
		{:else}
			<div
				class="flex h-36 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-600"
			>
				<span class="text-xs text-gray-300">Vide</span>
			</div>
		{/if}
		<span class="text-xs text-gray-300">Pile</span>
	</div>
</div>
