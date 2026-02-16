<script lang="ts">
	import PlayableCard from './PlayableCard.svelte';
	import PlayerMat from './PlayerMat.svelte';
	import type { PlayableCard as PlayableCardType } from '$lib/types/game';

	interface PlayerMatData {
		userId: string;
		cards: PlayableCardType[];
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
		};
	}

	interface Props {
		currentUserId: string;
		activePlayerId: string;
		mats: PlayerMatData[];
		deckCount: number;
		pile: PlayableCardType[];
	}

	let { currentUserId, activePlayerId, mats, deckCount, pile }: Props = $props();

	/**
	 * Réordonne les mats pour que le joueur actuel soit toujours en bas (index 0),
	 * les autres se placent dans le sens horaire autour de la table.
	 */
	const orderedMats = $derived.by(() => {
		const currentIndex = mats.findIndex((m) => m.userId === currentUserId);
		if (currentIndex === -1) return mats;
		return [...mats.slice(currentIndex), ...mats.slice(0, currentIndex)];
	});

	const topCard = $derived(pile.length > 0 ? pile[pile.length - 1] : null);

	/**
	 * Edges : bottom, left, top, right
	 * Chaque joueur est assigné à une arête de la table.
	 * La rotation suit l'arête : bottom=0°, left=90°, top=180°, right=-90°
	 */
	type Edge = 'bottom' | 'left' | 'top' | 'right';

	const edgeLayouts: Record<number, Edge[]> = {
		2: ['bottom', 'top'],
		3: ['bottom', 'left', 'top'],
		4: ['bottom', 'left', 'top', 'right'],
		5: ['bottom', 'left', 'top', 'top', 'right'],
		6: ['bottom', 'bottom', 'left', 'top', 'top', 'right']
	};

	const edgePositions: Record<Edge, string> = {
		bottom: 'bottom-2 left-1/2 -translate-x-1/2',
		top: 'top-2 left-1/2 -translate-x-1/2',
		left: 'left-2 top-1/2 -translate-y-1/2',
		right: 'right-2 top-1/2 -translate-y-1/2'
	};

	const edgeRotations: Record<Edge, string> = {
		bottom: '',
		top: '',
		left: '',
		right: ''
	};

	// Si 2+ joueurs sur la même arête, on les décale
	const edgeMultiPositions: Record<Edge, string[]> = {
		top: [
			'top-2 left-1/4 -translate-x-1/2',
			'top-2 left-1/2 -translate-x-1/2',
			'top-2 left-3/4 -translate-x-1/2'
		],
		left: ['left-2 top-1/3 -translate-y-1/2', 'left-2 top-2/3 -translate-y-1/2'],
		right: ['right-2 top-1/3 -translate-y-1/2', 'right-2 top-2/3 -translate-y-1/2'],
		bottom: [
			'bottom-2 left-1/4 -translate-x-1/2',
			'bottom-2 left-1/2 -translate-x-1/2',
			'bottom-2 left-3/4 -translate-x-1/2'
		]
	};

	/**
	 * Calcule la position + rotation de chaque mat.
	 * Gère les arêtes avec 2 joueurs en les décalant.
	 */
	const matPlacements = $derived.by(() => {
		const edges = edgeLayouts[orderedMats.length] ?? edgeLayouts[2];
		const placements: { position: string; rotation: string; edge: Edge }[] = [];

		// Compter les occurrences par arête pour savoir où décaler
		const edgeCounts: Record<Edge, number> = { bottom: 0, left: 0, top: 0, right: 0 };
		const edgeIndexes: Record<Edge, number> = { bottom: 0, left: 0, top: 0, right: 0 };

		for (const edge of edges) {
			edgeCounts[edge]++;
		}

		for (const edge of edges) {
			const rotation = edgeRotations[edge];
			let position: string;

			if (edgeCounts[edge] > 1) {
				// Pour 2 joueurs sur top/bottom, on utilise les positions 0 et 2 (1/4 et 3/4)
				// Pour bottom, on inverse l'ordre (premier à droite, deuxième à gauche)
				if (edgeCounts[edge] === 2 && (edge === 'top' || edge === 'bottom')) {
					if (edge === 'bottom') {
						position = edgeMultiPositions[edge][edgeIndexes[edge] === 0 ? 2 : 0];
					} else {
						position = edgeMultiPositions[edge][edgeIndexes[edge] === 0 ? 0 : 2];
					}
				} else {
					position = edgeMultiPositions[edge][edgeIndexes[edge]] ?? edgePositions[edge];
				}
				edgeIndexes[edge]++;
			} else {
				position = edgePositions[edge];
			}

			placements.push({ position, rotation, edge });
		}

		return placements;
	});
</script>

<!-- Table de jeu -->
<div class="relative mx-auto h-full w-full">
	<!-- Surface de la table -->
	<div
		class="absolute inset-0 rounded-3xl border-8 border-green-950 bg-green-900/80 shadow-2xl"
	></div>

	<!-- Centre : Deck + Pile -->
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

	<!-- Player Mats positionnés sur les arêtes -->
	{#each orderedMats as mat, i}
		<div class="absolute {matPlacements[i].position}">
			<PlayerMat
				playerName={mat.user.name}
				cards={mat.cards}
				isCurrentPlayer={mat.userId === currentUserId}
				isActivePlayer={mat.userId === activePlayerId}
				edge={matPlacements[i].edge}
			/>
		</div>
	{/each}
</div>
