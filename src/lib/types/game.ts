export enum GameStatus {
	STARTING = 'starting',
	DRAW_PHASE = 'draw_phase',
	ACTION_PHASE = 'action_phase',
	GABO = 'gabo',
	FINISHED = 'finished'
}
export type CardValue =
	| 'A'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'
	| '10'
	| 'J'
	| 'Q'
	| 'K';
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Card = `${CardSuit}-${CardValue}`;
export type PlayableCard = Card | 'unknown';

export type GameConfig = {
	maxScore: number;
    smallPenalty: number;
    bigPenalty: number;
    scoreFallbacks: [number, number][];
};
