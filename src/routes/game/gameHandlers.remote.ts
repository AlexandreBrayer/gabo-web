import { query, command } from '$app/server';
import * as v from 'valibot';
import { getAnonymizedFullGameState } from '$lib/server/game';

export const getGameState = query(v.string(), async (roomId) => {
    return getAnonymizedFullGameState(roomId);
});
