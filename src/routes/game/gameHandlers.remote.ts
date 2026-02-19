import { query, command } from '$app/server';
import * as v from 'valibot';
import { getAnonymizedFullGameState, getTwoFirstCardsInMat, setMatReady } from '$lib/server/game';
import { getUserFromLocals } from '$lib/server/auth';

export const getGameState = query(v.string(), async (roomId) => {
	return getAnonymizedFullGameState(roomId);
});

export const getTwoFirstCards = query(v.string(), async (roomId) => {
	const user = getUserFromLocals();
	const [cards, anonimizedGameState] = await Promise.all([
		getTwoFirstCardsInMat(roomId, user.id),
		getAnonymizedFullGameState(roomId)
	]);

	// Révéler les 2 premières cartes du joueur
	const mats = anonimizedGameState.mats.map((mat) =>
		mat.userId === user.id ? { ...mat, cards: [cards[0], cards[1], ...mat.cards.slice(2)] } : mat
	);

	return {
		game: anonimizedGameState.game,
		mats
	};
});

export const setReady = command(v.string(), async (roomId) => {
	const user = getUserFromLocals();
	await setMatReady(roomId, user.id, true);
});

export const setNotReady = command(v.string(), async (roomId) => {
	const user = getUserFromLocals();
	await setMatReady(roomId, user.id, false);
});
