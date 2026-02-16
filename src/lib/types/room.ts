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

