PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sightings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`location` blob,
	`description` text,
	`sighting_time` integer DEFAULT (unixepoch()) NOT NULL,
	`weather_condition` text,
	`confidence` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sightings`("id", "stray_id", "user_id", "lat", "lng", "location", "description", "sighting_time", "weather_condition", "confidence", "notes", "created_at") SELECT "id", "stray_id", "user_id", "lat", "lng", "location", "description", "sighting_time", "weather_condition", "confidence", "notes", "created_at" FROM `sightings`;--> statement-breakpoint
DROP TABLE `sightings`;--> statement-breakpoint
ALTER TABLE `__new_sightings` RENAME TO `sightings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;