import type { Card, GameConfig, PlayableCard } from '$lib/types/game';

export const defaultGameConfig: GameConfig = {
	maxScore: 120,
	smallPenalty: 25,
	bigPenalty: 50,
	scoreFallbacks: [
		[100, 50],
		[50, 25]
	]
};

/**
 * Initialise le deck de cartes pour une partie
 */
export function initializeDeck(): Card[] {
	const deck: Card[] = [];
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
	const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

	// Créer un deck de 52 cartes (13 valeurs × 4 couleurs)
	for (const suit of suits) {
		for (const value of values) {
			deck.push(`${suit}-${value}`);
		}
	}

	// Mélanger le deck
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}

	return deck;
}

/**
 * Distribue les cartes initiales aux joueurs
 */
export function dealCards(deck: Card[], playerCount: number): { deck: Card[]; playerCards: Card[][] } {
	const playerCards: Card[][] = [];
	const updatedDeck = [...deck];

	// Chaque joueur reçoit 4 cartes
	for (let i = 0; i < playerCount; i++) {
		const cards = updatedDeck.splice(0, 4);
		playerCards.push(cards);
	}

	return { deck: updatedDeck, playerCards };
}

/**
 * Anonymise les cartes d'un deck ou d'une main
 */
export function anonymizeCards<T extends PlayableCard[]>(cards: T): 'unknown'[] {
	return cards.map(() => 'unknown' as const);
}
