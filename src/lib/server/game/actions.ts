import { GameStatus } from '$lib/types/game';
import { broadcastGameUpdate, broadcastPersonalGameUpdate } from '../sse';
import {
	getAnonymizedFullGameState,
	getGameState,
	getPersonalGameState,
	updateGameStatus,
	updateGameDeck,
	updateGamePile,
	updateMatReady,
	setHandledCard,
	swapHandledCardWithMat,
	discardHandledCardToPile,
} from './db';
import { error } from '@sveltejs/kit';

/**
 * Marque un joueur comme prêt ou pas prêt, et broadcast l'état du jeu.
 * Si tous les joueurs sont prêts, passe au statut DRAW_PHASE.
 */
export async function setMatReady(
	roomId: string,
	userId: string,
	isReady: boolean
): Promise<void> {
	// Mettre à jour l'état ready dans la DB
	await updateMatReady(roomId, userId, isReady);

	// Récupérer l'état du jeu
	const gameState = await getAnonymizedFullGameState(roomId);

	// Si tous les joueurs sont prêts, passer à la phase de tirage
	if (gameState.game.status === GameStatus.STARTING && gameState.mats.every((mat) => mat.isReady)) {
		await updateGameStatus(roomId, GameStatus.DRAW_PHASE);
		const updatedGameState = await getAnonymizedFullGameState(roomId);
		broadcastGameUpdate(roomId, updatedGameState);
		return;
	}

	// Sinon, juste broadcast l'état actuel
	broadcastGameUpdate(roomId, gameState);
}

/**
 * Pioche une carte depuis le deck et la met dans la main du joueur.
 */
export async function drawFromDeck(roomId: string, userId: string): Promise<void> {
	const game = await getGameState(roomId);

	if (game.status !== GameStatus.DRAW_PHASE) {
		throw error(400, 'Not in draw phase');
	}
	if (game.currentPlayerId !== userId) {
		throw error(403, 'Not your turn');
	}
	if (game.deck.length === 0) {
		throw error(400, 'Deck is empty');
	}

	const [card, ...remainingDeck] = game.deck;

	await updateGameDeck(roomId, remainingDeck, GameStatus.ACTION_PHASE);
	await setHandledCard(roomId, userId, card, 'deck');

	const [updatedGameState, personalGameState] = await Promise.all([
		getAnonymizedFullGameState(roomId),
		getPersonalGameState(roomId, userId)
	]);
	broadcastGameUpdate(roomId, updatedGameState);
	broadcastPersonalGameUpdate(roomId, userId, personalGameState);
}

/**
 * Pioche la carte du dessus de la pile et la met dans la main du joueur.
 */
export async function drawFromPile(roomId: string, userId: string): Promise<void> {
	const game = await getGameState(roomId);

	if (game.status !== GameStatus.DRAW_PHASE) {
		throw error(400, 'Not in draw phase');
	}
	if (game.currentPlayerId !== userId) {
		throw error(403, 'Not your turn');
	}
	if (game.pile.length === 0) {
		throw error(400, 'Pile is empty');
	}

	const card = game.pile[game.pile.length - 1];
	const newPile = game.pile.slice(0, -1);

	await updateGamePile(roomId, newPile, GameStatus.ACTION_PHASE);
	await setHandledCard(roomId, userId, card, 'pile');

	const [updatedGameState, personalGameState] = await Promise.all([
		getAnonymizedFullGameState(roomId),
		getPersonalGameState(roomId, userId)
	]);
	broadcastGameUpdate(roomId, updatedGameState);
	broadcastPersonalGameUpdate(roomId, userId, personalGameState);
}

/**
 * Échange la handledCard avec une carte du mat du joueur.
 */
export async function swapCardWithHand(
	roomId: string,
	userId: string,
	cardIndex: number
): Promise<void> {
	const game = await getGameState(roomId);

	if (game.status !== GameStatus.ACTION_PHASE) {
		throw error(400, 'Not in action phase');
	}
	if (game.currentPlayerId !== userId) {
		throw error(403, 'Not your turn');
	}

	await swapHandledCardWithMat(roomId, userId, cardIndex);

	const [updatedGameState, personalGameState] = await Promise.all([
		getAnonymizedFullGameState(roomId),
		getPersonalGameState(roomId, userId)
	]);
	broadcastGameUpdate(roomId, updatedGameState);
	broadcastPersonalGameUpdate(roomId, userId, personalGameState);
}

/**
 * Utilise l'effet de la carte piochée (TODO), puis la défausse dans la pile.
 */
export async function useCardEffect(roomId: string, userId: string): Promise<void> {
	const game = await getGameState(roomId);

	if (game.status !== GameStatus.ACTION_PHASE) {
		throw error(400, 'Not in action phase');
	}
	if (game.currentPlayerId !== userId) {
		throw error(403, 'Not your turn');
	}

	// TODO: use action card effect
	console.log('todo use action card');

	await discardHandledCardToPile(roomId, userId);

	const [updatedGameState, personalGameState] = await Promise.all([
		getAnonymizedFullGameState(roomId),
		getPersonalGameState(roomId, userId)
	]);
	broadcastGameUpdate(roomId, updatedGameState);
	broadcastPersonalGameUpdate(roomId, userId, personalGameState);
}
