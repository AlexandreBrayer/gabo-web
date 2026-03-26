import { db } from '../db/index';
import { gameState, playerMat, roomParticipant } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { GameStatus } from '$lib/types/game';
import type { PlayableCard, Card } from '$lib/types/game';
import { initializeDeck, dealCards, defaultGameConfig, anonymizeCards } from './logic';

/**
 * Crée une nouvelle partie de jeu dans la DB
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
	const config = { ...defaultGameConfig };

	// Créer le game state
	await db.insert(gameState).values({
		roomId,
		status: GameStatus.STARTING,
		config,
		deck: remainingDeck,
		pile: [],
		currentPlayerId: firstPlayerId
	});

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
 * Récupère l'état actuel du jeu depuis la DB
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
 * Récupère les player mats de tous les joueurs depuis la DB
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
 * Récupère le player mat d'un joueur spécifique depuis la DB
 */
export async function getPlayerMat(roomId: string, userId: string) {
	const mat = await db.query.playerMat.findFirst({
		where: and(eq(playerMat.roomId, roomId), eq(playerMat.userId, userId)),
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
 * Met à jour le statut du jeu dans la DB
 */
export async function updateGameStatus(roomId: string, status: GameStatus): Promise<void> {
	await db.update(gameState).set({ status }).where(eq(gameState.roomId, roomId));
}

/**
 * Met à jour le deck et le statut du jeu dans la DB
 */
export async function updateGameDeck(
	roomId: string,
	deck: Card[],
	status: GameStatus
): Promise<void> {
	await db.update(gameState).set({ deck, status }).where(eq(gameState.roomId, roomId));
}

/**
 * Met à jour la pile et le statut du jeu dans la DB
 */
export async function updateGamePile(
	roomId: string,
	pile: Card[],
	status: GameStatus
): Promise<void> {
	await db.update(gameState).set({ pile, status }).where(eq(gameState.roomId, roomId));
}

/**
 * Met à jour la carte en main d'un joueur
 */
export async function setHandledCard(
	roomId: string,
	userId: string,
	card: PlayableCard
): Promise<void> {
	await db
		.update(playerMat)
		.set({ handledCard: card })
		.where(and(eq(playerMat.roomId, roomId), eq(playerMat.userId, userId)));
}

/**
 * Met à jour l'état ready d'un player mat dans la DB
 */
export async function updateMatReady(
	roomId: string,
	userId: string,
	isReady: boolean
): Promise<void> {
	await db
		.update(playerMat)
		.set({ isReady })
		.where(and(eq(playerMat.roomId, roomId), eq(playerMat.userId, userId)));
}

/**
 * Supprime une partie et toutes ses données associées de la DB
 * @todo a supprimer que pour le dev
 */
export async function deleteGame(roomId: string): Promise<void> {
	// La suppression cascade sur playerMat et score grâce aux foreign keys
	await db.delete(gameState).where(eq(gameState.roomId, roomId));
}

/**
 * Récupère les 2 premières cartes du mat d'un joueur
 */
export async function getTwoFirstCardsInMat(
	roomId: string,
	userId: string
): Promise<PlayableCard[]> {
	const game = await db.query.gameState.findFirst({
		where: eq(gameState.roomId, roomId)
	});

	if (!game) {
		throw error(404, 'Game not found');
	}

	if (game.status !== GameStatus.STARTING) {
		throw error(400, 'Game is not in starting status');
	}

	const mat = await db.query.playerMat.findFirst({
		where: and(eq(playerMat.roomId, roomId), eq(playerMat.userId, userId))
	});

	if (!mat) {
		throw error(404, 'Player mat not found');
	}

	return mat.cards.slice(0, 2);
}

/**
 * Récupère l'état complet du jeu (non anonymisé)
 */
export async function getFullGameState(roomId: string) {
	const [game, mats] = await Promise.all([getGameState(roomId), getPlayerMats(roomId)]);
	return { game, mats };
}

export type FullGameState = Awaited<ReturnType<typeof getFullGameState>>;

/**
 * Récupère l'état complet du jeu avec les cartes anonymisées
 */
export async function getAnonymizedFullGameState(roomId: string) {
	const [game, mats] = await Promise.all([getGameState(roomId), getPlayerMats(roomId)]);

	const anonymizedMats = mats.map((mat) => ({
		...mat,
		cards: anonymizeCards(mat.cards) as PlayableCard[],
		handledCard: mat.handledCard ? ('unknown' as PlayableCard) : null
	}));

	const anonymizedDeck = anonymizeCards(game.deck) as PlayableCard[];

	return { game: { ...game, deck: anonymizedDeck }, mats: anonymizedMats };
}

export type AnonymizedFullGameState = Awaited<ReturnType<typeof getAnonymizedFullGameState>>;

/**
 * Récupère l'état du jeu anonymisé mais révèle la handledCard de l'utilisateur concerné
 */
export async function getPersonalGameState(roomId: string, userId: string) {
	const anonymized = await getAnonymizedFullGameState(roomId);

	// Récupérer la vraie handledCard du joueur
	const mat = await getPlayerMat(roomId, userId);

	const mats = anonymized.mats.map((m) =>
		m.userId === userId ? { ...m, handledCard: mat.handledCard } : m
	);

	return { ...anonymized, mats };
}
