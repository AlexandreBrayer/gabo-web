import { GameStatus } from '$lib/types/game';
import { broadcastGameUpdate } from '../sse';
import {
	getAnonymizedFullGameState,
	updateGameStatus,
	updateMatReady,
} from './db';

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
