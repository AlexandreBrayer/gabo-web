/**
 * Enum pour les différents canaux SSE
 */
export enum SSEChannel {
	ROOM_UPDATED = 'room:updated',
	CHAT_MESSAGE = 'chat:message',
	ROOM_GAME_UPDATE = 'room:game-update',
	PERSONAL_GAME_UPDATE = 'game:personal-update'
}

/**
 * Type pour les événements SSE
 */
export type SSEEvent<T = unknown> = {
	channel: SSEChannel;
	data: T;
};
