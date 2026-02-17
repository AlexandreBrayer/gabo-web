<script lang="ts">
	import PlayableCard from './PlayableCard.svelte';
	import type { PlayableCard as PlayableCardType } from '$lib/types/game';

	interface Props {
		deckCount: number;
		topCard: PlayableCardType | null;
	}

	let { deckCount, topCard }: Props = $props();
</script>

<div class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4">
	<!-- Deck -->
	{#if deckCount > 0}
		<div class="flex flex-col items-center gap-1">
			<PlayableCard card="unknown" size="sm" />
			<span class="text-xs text-gray-300">{deckCount}</span>
		</div>
	{:else}
		<div
			class="flex h-36 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-600"
		>
			<span class="text-xs text-gray-500">Vide</span>
		</div>
	{/if}

	<!-- Pile -->
	{#if topCard}
		<div class="flex flex-col items-center gap-1">
			<PlayableCard card={topCard} size="sm" />
			<span class="text-xs text-gray-300">Pile</span>
		</div>
	{:else}
		<div
			class="flex h-36 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-600"
		>
			<span class="text-xs text-gray-500">Pile</span>
		</div>
	{/if}
</div>
