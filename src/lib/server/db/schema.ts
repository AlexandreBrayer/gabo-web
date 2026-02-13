import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { user } from './auth.schema';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

// Game Rooms
export const gameRoom = sqliteTable(
	'game_room',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		code: text('code').unique(), // code d'accès pour rooms privées (null = publique)
		isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
		maxPlayers: integer('max_players').notNull().default(4),
		status: text('status').notNull().default('waiting'), // waiting, playing, finished
		ownerId: text('owner_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('game_room_owner_idx').on(table.ownerId), index('game_room_code_idx').on(table.code)]
);

// Participants aux game rooms
export const roomParticipant = sqliteTable(
	'room_participant',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		roomId: text('room_id')
			.notNull()
			.references(() => gameRoom.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		isReady: integer('is_ready', { mode: 'boolean' }).notNull().default(false),
		joinedAt: integer('joined_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		index('room_participant_room_idx').on(table.roomId),
		index('room_participant_user_idx').on(table.userId)
	]
);

// Messages de chat
export const chatMessage = sqliteTable(
	'chat_message',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		roomId: text('room_id')
			.notNull()
			.references(() => gameRoom.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		message: text('message').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('chat_message_room_idx').on(table.roomId)]
);

// Relations
export const gameRoomRelations = relations(gameRoom, ({ one, many }) => ({
	owner: one(user, {
		fields: [gameRoom.ownerId],
		references: [user.id]
	}),
	participants: many(roomParticipant),
	messages: many(chatMessage)
}));

export const roomParticipantRelations = relations(roomParticipant, ({ one }) => ({
	room: one(gameRoom, {
		fields: [roomParticipant.roomId],
		references: [gameRoom.id]
	}),
	user: one(user, {
		fields: [roomParticipant.userId],
		references: [user.id]
	})
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
	room: one(gameRoom, {
		fields: [chatMessage.roomId],
		references: [gameRoom.id]
	}),
	user: one(user, {
		fields: [chatMessage.userId],
		references: [user.id]
	})
}));

export * from './auth.schema';
