import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { user } from './auth.schema';
import { GameStatus, type Card, type PlayableCard } from '../../types/game';

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

// Game State
export const gameState = sqliteTable('game_state', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	roomId: text('room_id')
		.notNull()
		.unique()
		.references(() => gameRoom.id, { onDelete: 'cascade' }),
	status: text('status').notNull().default(GameStatus.STARTING).$type<GameStatus>(), // starting, draw_phase, action_phase, gabo, finished
	config: text('config', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
	deck: text('deck', { mode: 'json' }).notNull().$type<Card[]>(),
	pile: text('pile', { mode: 'json' }).notNull().$type<Card[]>(),
	currentPlayerId: text('current_player_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

// Player Mat (zone de jeu du joueur)
export const playerMat = sqliteTable(
	'player_mat',
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
		cards: text('cards', { mode: 'json' }).notNull().$type<PlayableCard[]>(),
		handledCard: text('handled_card').$type<PlayableCard | null>().default(null),
		isReady: integer('is_ready', { mode: 'boolean' }).notNull().default(false),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('player_mat_room_idx').on(table.roomId),
		index('player_mat_user_idx').on(table.userId)
	]
);

// Score (feuille de score par round)
export const score = sqliteTable(
	'score',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		gameStateId: text('game_state_id')
			.notNull()
			.references(() => gameState.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		round: integer('round').notNull(),
		scoreType: text('score_type').notNull(), // 'gabo', 'score', 'penalite'
		value: integer('value').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		index('score_game_state_idx').on(table.gameStateId),
		index('score_user_idx').on(table.userId),
		index('score_round_idx').on(table.round)
	]
);

// Relations
export const gameRoomRelations = relations(gameRoom, ({ one, many }) => ({
	owner: one(user, {
		fields: [gameRoom.ownerId],
		references: [user.id]
	}),
	participants: many(roomParticipant),
	messages: many(chatMessage),
	gameState: one(gameState, {
		fields: [gameRoom.id],
		references: [gameState.roomId]
	}),
	playerMats: many(playerMat)
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

export const gameStateRelations = relations(gameState, ({ one, many }) => ({
	room: one(gameRoom, {
		fields: [gameState.roomId],
		references: [gameRoom.id]
	}),
	currentPlayer: one(user, {
		fields: [gameState.currentPlayerId],
		references: [user.id]
	}),
	scores: many(score)
}));

export const playerMatRelations = relations(playerMat, ({ one }) => ({
	room: one(gameRoom, {
		fields: [playerMat.roomId],
		references: [gameRoom.id]
	}),
	user: one(user, {
		fields: [playerMat.userId],
		references: [user.id]
	})
}));

export const scoreRelations = relations(score, ({ one }) => ({
	gameState: one(gameState, {
		fields: [score.gameStateId],
		references: [gameState.id]
	}),
	user: one(user, {
		fields: [score.userId],
		references: [user.id]
	})
}));

export * from './auth.schema';
