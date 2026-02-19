import { db } from '../db/index';
import { gameState, playerMat, roomParticipant } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { GameStatus } from '$lib/types/game';
import type { PlayableCard } from '$lib/types/game';
import { broadcastGameUpdate } from '../sse';
import { initializeDeck, dealCards, defaultGameConfig, anonymizeCards } from './logic';

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
 * Supprime une partie et toutes ses données associées
 * todo a supprimer que pour le dev
 */
export async function deleteGame(roomId: string): Promise<void> {
	// La suppression cascade sur playerMat et score grâce aux foreign keys
	await db.delete(gameState).where(eq(gameState.roomId, roomId));
}

/**
 * Change le statut du jeu
 */
export async function setGameStatus(roomId: string, status: GameStatus): Promise<void> {
	await db.update(gameState).set({ status }).where(eq(gameState.roomId, roomId));
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
		cards: anonymizeCards(mat.cards) as PlayableCard[]
	}));

	const anonymizedDeck = anonymizeCards(game.deck) as PlayableCard[];

	return { game: { ...game, deck: anonymizedDeck }, mats: anonymizedMats };
}

export type AnonymizedFullGameState = Awaited<ReturnType<typeof getAnonymizedFullGameState>>;

/**
 * Marque un joueur comme prêt ou pas prêt, et broadcast l'état du jeu
 * Si tous les joueurs sont prêts, passe au statut DRAW_PHASE
 */
export async function setMatReady(
	roomId: string,
	userId: string,
	isReady: boolean
): Promise<void> {
	await db
		.update(playerMat)
		.set({ isReady })
		.where(and(eq(playerMat.roomId, roomId), eq(playerMat.userId, userId)));

	const gameState = await getAnonymizedFullGameState(roomId);

	// Si tous les joueurs sont prêts, passer à la phase de tirage
	if (gameState.game.status === GameStatus.STARTING && gameState.mats.every((mat) => mat.isReady)) {
		await setGameStatus(roomId, GameStatus.DRAW_PHASE);
		const updatedGameState = await getAnonymizedFullGameState(roomId);
		broadcastGameUpdate(roomId, updatedGameState);
		return;
	}
    broadcastGameUpdate(roomId, gameState);
}
