import { db } from '../db/index';
import { gameState, playerMat, roomParticipant } from '../db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { GameStatus } from '$lib/types/game';
/**
 * Initialise le deck de cartes pour une partie
 */
function initializeDeck(): string[] {
	const deck: string[] = [];
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
	const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	
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
function dealCards(deck: string[], playerCount: number): { deck: string[], playerCards: string[][] } {
	const playerCards: string[][] = [];
	const updatedDeck = [...deck];
	
	// Chaque joueur reçoit 4 cartes
	for (let i = 0; i < playerCount; i++) {
		const cards = updatedDeck.splice(0, 4);
		playerCards.push(cards);
	}
	
	return { deck: updatedDeck, playerCards };
}

/**
 * Crée une nouvelle partie de jeu
 */
export async function createGame(roomId: string): Promise<void> {
	// Récupérer les participants de la room
	const participants = await db.query.roomParticipant.findMany({
		where: eq(roomParticipant.roomId, roomId),
		orderBy: (participant, { asc }) => [asc(participant.joinedAt)]
	});

	// Vérifier qu'il n'y a pas déjà une game en cours
	const existingGame = await db.query.gameState.findFirst({
		where: eq(gameState.roomId, roomId)
	});

	if (existingGame) {
		throw error(400, 'Une partie est déjà en cours pour cette room');
	}

	// Initialiser le deck
	const deck = initializeDeck();
	
	// Distribuer les cartes
	const { deck: remainingDeck, playerCards } = dealCards(deck, participants.length);

	// Le premier joueur est celui qui a rejoint en premier
	const firstPlayerId = participants[0].userId;

	// Configuration par défaut du jeu
	const config = {
		maxScore: 100,
		round: 1,
		discardPile: [] as string[]
	};

	// Créer le game state
	await db.insert(gameState).values({
		roomId,
		status: GameStatus.STARTING,
		config,
		deck: remainingDeck,
		currentPlayerId: firstPlayerId
	})

	// Créer les player mats pour chaque joueur
	for (let i = 0; i < participants.length; i++) {
		await db.insert(playerMat).values({
			roomId,
			userId: participants[i].userId,
			cards: playerCards[i]
		});
	}
}

/**
 * Récupère l'état actuel du jeu
 */
export async function getGameState(roomId: string) {
	const game = await db.query.gameState.findFirst({
		where: eq(gameState.roomId, roomId),
		with: {
			currentPlayer: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true
				}
			}
		}
	});

	if (!game) {
		throw error(404, 'Game not found');
	}

	return game;
}

/**
 * Récupère les player mats de tous les joueurs
 */
export async function getPlayerMats(roomId: string) {
	return db.query.playerMat.findMany({
		where: eq(playerMat.roomId, roomId),
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true
				}
			}
		}
	});
}

/**
 * Récupère le player mat d'un joueur spécifique
 */
export async function getPlayerMat(roomId: string, userId: string) {
	const mat = await db.query.playerMat.findFirst({
		where: eq(playerMat.roomId, roomId) && eq(playerMat.userId, userId),
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true
				}
			}
		}
	});

	if (!mat) {
		throw error(404, 'Player mat not found');
	}

	return mat;
}

/**
 * Supprime une partie et toutes ses données associées
 */
export async function deleteGame(roomId: string): Promise<void> {
	// La suppression cascade sur playerMat et score grâce aux foreign keys
	await db.delete(gameState).where(eq(gameState.roomId, roomId));
}
