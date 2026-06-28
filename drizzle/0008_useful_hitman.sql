PRAGMA defer_foreign_keys=on;--> statement-breakpoint
CREATE TABLE `__new_naming_suggestions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`name` text(50) NOT NULL,
	`description` text(1000),
	`is_selected` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_naming_suggestions`("id", "stray_id", "user_id", "name", "description", "is_selected", "created_at") SELECT "id", "stray_id", "user_id", "name", "description", "is_selected", "created_at" FROM `naming_suggestions`;--> statement-breakpoint
DROP TABLE `naming_suggestions`;--> statement-breakpoint
ALTER TABLE `__new_naming_suggestions` RENAME TO `naming_suggestions`;--> statement-breakpoint
CREATE INDEX `naming_suggestions_stray_id_idx` ON `naming_suggestions` (`stray_id`);--> statement-breakpoint
CREATE TABLE `__new_sightings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`location` text,
	`description` text(1000),
	`sighting_time` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sightings`("id", "stray_id", "user_id", "lat", "lng", "location", "description", "sighting_time", "created_at") SELECT "id", "stray_id", "user_id", "lat", "lng", "location", "description", "sighting_time", "created_at" FROM `sightings`;--> statement-breakpoint
DROP TABLE `sightings`;--> statement-breakpoint
ALTER TABLE `__new_sightings` RENAME TO `sightings`;--> statement-breakpoint
CREATE INDEX `sightings_stray_time_idx` ON `sightings` (`stray_id`,`sighting_time`);--> statement-breakpoint
CREATE INDEX `sightings_lat_lng_idx` ON `sightings` (`lat`,`lng`);--> statement-breakpoint
CREATE INDEX `sightings_user_id_idx` ON `sightings` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_stray_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`url` text NOT NULL,
	`file_name` text,
	`file_size` integer,
	`mime_type` text,
	`description` text(1000),
	`is_primary` integer DEFAULT false,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_stray_photos`("id", "stray_id", "user_id", "url", "file_name", "file_size", "mime_type", "description", "is_primary", "uploaded_at") SELECT "id", "stray_id", "user_id", "url", "file_name", "file_size", "mime_type", "description", "is_primary", "uploaded_at" FROM `stray_photos`;--> statement-breakpoint
DROP TABLE `stray_photos`;--> statement-breakpoint
ALTER TABLE `__new_stray_photos` RENAME TO `stray_photos`;--> statement-breakpoint
CREATE TABLE `__new_strays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`species` text NOT NULL,
	`breed` text,
	`age` text,
	`size` text NOT NULL,
	`colors` text,
	`markings` text,
	`status` text DEFAULT 'spotted' NOT NULL,
	`description` text(1000),
	`health_notes` text,
	`care_requirements` text,
	`primary_location` text,
	`caretaker_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`caretaker_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_strays`("id", "name", "species", "breed", "age", "size", "colors", "markings", "status", "description", "health_notes", "care_requirements", "primary_location", "caretaker_id", "created_at", "updated_at") SELECT "id", "name", "species", "breed", "age", "size", "colors", "markings", "status", "description", "health_notes", "care_requirements", "primary_location", "caretaker_id", "created_at", "updated_at" FROM `strays`;--> statement-breakpoint
DROP TABLE `strays`;--> statement-breakpoint
ALTER TABLE `__new_strays` RENAME TO `strays`;--> statement-breakpoint
CREATE INDEX `strays_status_idx` ON `strays` (`status`);--> statement-breakpoint
CREATE INDEX `strays_updated_at_idx` ON `strays` (`updated_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `naming_votes_suggestion_user_idx` ON `naming_votes` (`naming_suggestion_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `sighting_photos_sighting_id_idx` ON `sighting_photos` (`sighting_id`);--> statement-breakpoint
CREATE INDEX `stray_subscriptions_user_id_idx` ON `stray_subscriptions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `stray_subscriptions_stray_user_idx` ON `stray_subscriptions` (`stray_id`,`user_id`);