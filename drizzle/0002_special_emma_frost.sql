CREATE TABLE `score` (
	`id` text PRIMARY KEY NOT NULL,
	`game_state_id` text NOT NULL,
	`user_id` text NOT NULL,
	`round` integer NOT NULL,
	`score_type` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`game_state_id`) REFERENCES `game_state`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `score_game_state_idx` ON `score` (`game_state_id`);--> statement-breakpoint
CREATE INDEX `score_user_idx` ON `score` (`user_id`);--> statement-breakpoint
CREATE INDEX `score_round_idx` ON `score` (`round`);--> statement-breakpoint
ALTER TABLE `game_state` ADD `current_player_id` text NOT NULL REFERENCES user(id);