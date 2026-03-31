import { query, command } from '$app/server';
import * as v from 'valibot';
import { setMatReady, drawFromDeck, drawFromPile, swapCardWithHand, useCardEffect, discardCard as discardCardAction } from '$lib/server/game/actions';
import { getUserFromLocals } from '$lib/server/auth';
import { getAnonymizedFullGameState, getPersonalGameState, getTwoFirstCardsInMat } from '$lib/server/game/db';

export const getGameState = query(v.string(), async (roomId) => {
	return getAnonymizedFullGameState(roomId);
});

export const getMyGameState = query(v.string(), async (roomId) => {
	const user = getUserFromLocals();
	return getPersonalGameState(roomId, user.id);
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

export const drawDeck = command(v.string(), async (roomId) => {
	const user = getUserFromLocals();
	await drawFromDeck(roomId, user.id);
});

export const drawPile = command(v.string(), async (roomId) => {
	const user = getUserFromLocals();
	await drawFromPile(roomId, user.id);
});

export const swapCard = command(v.object({ roomId: v.string(), cardIndex: v.number() }), async ({ roomId, cardIndex }) => {
	const user = getUserFromLocals();
	await swapCardWithHand(roomId, user.id, cardIndex);
});

export const useEffect = command(v.string(), async (roomId) => {
	const user = getUserFromLocals();
	await useCardEffect(roomId, user.id);
});

export const discardCard = command(v.string(), async (roomId) => {
	const user = getUserFromLocals();
	await discardCardAction(roomId, user.id);
});
