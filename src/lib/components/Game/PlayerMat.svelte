<script lang="ts">
	import PlayableCard from './PlayableCard.svelte';
	import type { PlayableCard as PlayableCardType } from '$lib/types/game';

	type Edge = 'bottom' | 'left' | 'top' | 'right';

	interface Props {
		playerName: string;
		cards: PlayableCardType[];
		isCurrentPlayer?: boolean;
		isActivePlayer?: boolean;
		edge?: Edge;
	}

	let { playerName, cards, isCurrentPlayer = false, isActivePlayer = false, edge = 'bottom' }: Props = $props();

	// Layout direction selon l'edge
	const isVertical = $derived(edge === 'left' || edge === 'right');
	const nameRotation = $derived(
		edge === 'left' ? 'rotate-90' : edge === 'right' ? '-rotate-90' : ''
	);
	const cardRotation = $derived(
		edge === 'left' ? 'rotate(90deg)' : edge === 'right' ? 'rotate(-90deg)' : edge === 'top' ? 'rotate(180deg)' : ''
	);
</script>

<div class="flex items-center gap-1 {isVertical ? 'flex-row' : 'flex-col'}">
	{#if isVertical}
		<!-- Pour left/right: wrapper avec width fixe pour le nom tourné -->
		<div class="w-5 flex items-center justify-center {edge === 'left' ? 'order-2' : ''}">
			<span
				class="text-xs font-semibold whitespace-nowrap {nameRotation} {isActivePlayer
					? 'text-yellow-400'
					: isCurrentPlayer
						? 'text-blue-400'
						: 'text-gray-300'}"
			>
				{playerName}
				{#if isCurrentPlayer}(Vous){/if}
			</span>
		</div>
	{:else}
		<span
			class="text-xs font-semibold whitespace-nowrap {nameRotation} {isActivePlayer
				? 'text-yellow-400'
				: isCurrentPlayer
					? 'text-blue-400'
					: 'text-gray-300'}"
		>
			{playerName}
			{#if isCurrentPlayer}(Vous){/if}
		</span>
	{/if}

	<!-- Cartes -->
	<div class="flex gap-1 {isVertical ? 'flex-col' : 'flex-row'} {edge === 'left' ? 'order-1' : ''}">
		{#each cards as card}
			{#if isVertical}
				<!-- Pour left/right: conteneur avec dimensions inversées (h-24 w-36 car carte sm = w-24 h-36) -->
				<div class="h-24 w-36 flex items-center justify-center">
					<PlayableCard {card} size="sm" style={cardRotation ? `transform: ${cardRotation}` : ''} />
				</div>
			{:else}
				<PlayableCard {card} size="sm" style={cardRotation ? `transform: ${cardRotation}` : ''} />
			{/if}
		{/each}
	</div>
</div>
