<script lang="ts">
	import Heart from '@lucide/svelte/icons/heart';
	import Diamond from '@lucide/svelte/icons/diamond';
	import Club from '@lucide/svelte/icons/club';
	import Spade from '@lucide/svelte/icons/spade';
	import type { PlayableCard, CardSuit, CardValue } from '$lib/types/game';

	interface Props {
		card: PlayableCard;
		size?: 'sm' | 'md' | 'lg';
	}

	let { card, size = 'md' }: Props = $props();

	// Tailles des cartes
	const sizes = {
		sm: 'w-24 h-36',
		md: 'w-28 h-40',
		lg: 'w-32 h-48'
	};

	const valueSizes = {
		sm: 'text-4xl',
		md: 'text-5xl',
		lg: 'text-6xl'
	};

	const iconSizes = {
		sm: 18,
		md: 20,
		lg: 22
	};

	// Parsing de la carte
	const isUnknown = $derived(card === 'unknown');
	const [suit, value] = $derived(
		!isUnknown ? (card.split('-') as [CardSuit, CardValue]) : [null, null]
	);

	// Couleurs des cartes
	const suitColors: Record<CardSuit, string> = {
		hearts: 'text-red-600',
		diamonds: 'text-red-600',
		clubs: 'text-gray-900',
		spades: 'text-gray-900'
	};

	// Composants d'icônes
	const suitIcons: Record<CardSuit, typeof Heart> = {
		hearts: Heart,
		diamonds: Diamond,
		clubs: Club,
		spades: Spade
	};

	const suitColor = $derived(suit ? suitColors[suit] : '');
	const SuitIcon = $derived(suit ? suitIcons[suit] : null);
</script>

{#if isUnknown}
	<!-- Dos de carte -->
	<div
		class="flex items-center justify-center rounded-lg border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-gray-600 shadow-lg {sizes[
			size
		]}"
	>
		<span class="{valueSizes[size]} font-bold text-white">G</span>
	</div>
{:else}
	<!-- Face de carte -->
	<div
		class="flex flex-col rounded-lg border-2 border-gray-300 bg-white p-2 shadow-lg {sizes[size]}"
	>
		<!-- Coin haut gauche -->
		<div class="w-4 flex flex-col items-center gap-0.5 {suitColor}">
			<span class="text-sm leading-none font-bold">{value}</span>
			{#if SuitIcon}
				<SuitIcon size={iconSizes[size]} strokeWidth={2.5} />
			{/if}
		</div>

		<!-- Centre -->
		<div class="flex flex-1 items-center justify-center {suitColor}">
			<p class="{valueSizes[size]} font-bold">{value}</p>
		</div>

		<!-- Coin bas droit (inversé) -->
		<div class="w-4 self-end flex flex-col-reverse items-center gap-0.5 {suitColor}">
			<span class="rotate-180 text-sm leading-none font-bold">{value}</span>
			{#if SuitIcon}
				<SuitIcon class="rotate-180" size={iconSizes[size]} strokeWidth={2.5} />
			{/if}
		</div>
	</div>
{/if}
