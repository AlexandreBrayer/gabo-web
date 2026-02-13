import type { gameRoom, roomParticipant, chatMessage } from '$lib/server/db/schema';

export type GameRoom = typeof gameRoom.$inferSelect;
export type NewGameRoom = typeof gameRoom.$inferInsert;

export type RoomParticipant = typeof roomParticipant.$inferSelect;
export type NewRoomParticipant = typeof roomParticipant.$inferInsert;

export type ChatMessage = typeof chatMessage.$inferSelect;
export type NewChatMessage = typeof chatMessage.$inferInsert;

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface GameRoomWithDetails extends GameRoom {
	participants: (RoomParticipant & {
		user: {
			id: string;
			name: string;
			email: string;
			image?: string | null;
		};
	})[];
	owner: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
	participantCount: number;
}

export interface ChatMessageWithUser extends ChatMessage {
	user: {
		id: string;
		name: string;
		image?: string | null;
	};
}

// Types pour WebSocket
export type WebSocketMessageType =
	| 'auth'
	| 'auth:success'
	| 'room:joined'
	| 'room:left'
	| 'room:leave'
	| 'room:updated'
	| 'chat:message'
	| 'chat:history'
	| 'chat:send'
	| 'player:ready'
	| 'game:start'
	| 'game:started'
	| 'game:ended'
	| 'ping'
	| 'pong'
	| 'error';

export interface WebSocketMessage<T = unknown> {
	type: WebSocketMessageType;
	payload: T;
	timestamp: number;
}

export interface RoomJoinedPayload {
	roomId: string;
	participant: RoomParticipant & {
		user: {
			id: string;
			name: string;
			image?: string | null;
		};
	};
}

export interface RoomLeftPayload {
	roomId: string;
	userId: string;
}

export interface ChatMessagePayload {
	message: ChatMessageWithUser;
}

export interface PlayerReadyPayload {
	roomId: string;
	userId: string;
	isReady: boolean;
}

export interface ErrorPayload {
	message: string;
	code?: string;
}

export interface AuthPayload {
	roomId: string;
	userId: string;
}

export interface AuthSuccessPayload {
	roomId: string;
}

export interface ChatSendPayload {
	message: string;
}

export interface ChatHistoryPayload {
	messages: ChatMessageWithUser[];
}

// Type helper pour les messages WebSocket typés
export type TypedWebSocketMessage<T extends WebSocketMessageType> = T extends 'auth'
	? WebSocketMessage<AuthPayload>
	: T extends 'auth:success'
		? WebSocketMessage<AuthSuccessPayload>
		: T extends 'room:joined'
			? WebSocketMessage<RoomJoinedPayload>
			: T extends 'room:left'
				? WebSocketMessage<RoomLeftPayload>
				: T extends 'chat:message'
					? WebSocketMessage<ChatMessagePayload>
					: T extends 'chat:history'
						? WebSocketMessage<ChatHistoryPayload>
						: T extends 'chat:send'
							? WebSocketMessage<ChatSendPayload>
							: T extends 'player:ready'
								? WebSocketMessage<PlayerReadyPayload>
								: T extends 'error'
									? WebSocketMessage<ErrorPayload>
									: WebSocketMessage<unknown>;
