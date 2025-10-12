PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bounties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text(200) NOT NULL,
	`description` text NOT NULL,
	`target_location` text,
	`area_type` text,
	`status` text DEFAULT 'open',
	`priority` text DEFAULT 'medium',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bounties`("id", "user_id", "title", "description", "target_location", "area_type", "status", "priority", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "target_location", "area_type", "status", "priority", "created_at", "updated_at" FROM `bounties`;--> statement-breakpoint
DROP TABLE `bounties`;--> statement-breakpoint
ALTER TABLE `__new_bounties` RENAME TO `bounties`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_care_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`care_type` text NOT NULL,
	`description` text NOT NULL,
	`location` text,
	`photos` text,
	`care_date` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_care_records`("id", "stray_id", "user_id", "care_type", "description", "location", "photos", "care_date", "created_at") SELECT "id", "stray_id", "user_id", "care_type", "description", "location", "photos", "care_date", "created_at" FROM `care_records`;--> statement-breakpoint
DROP TABLE `care_records`;--> statement-breakpoint
ALTER TABLE `__new_care_records` RENAME TO `care_records`;--> statement-breakpoint
CREATE TABLE `__new_community_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_id` integer NOT NULL,
	`title` text(200),
	`content` text NOT NULL,
	`post_type` text DEFAULT 'general',
	`stray_id` integer,
	`sighting_id` integer,
	`location` text,
	`media` text,
	`like_count` integer DEFAULT 0,
	`comment_count` integer DEFAULT 0,
	`share_count` integer DEFAULT 0,
	`is_published` integer DEFAULT true,
	`published_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sighting_id`) REFERENCES `sightings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_community_posts`("id", "author_id", "title", "content", "post_type", "stray_id", "sighting_id", "location", "media", "like_count", "comment_count", "share_count", "is_published", "published_at", "updated_at") SELECT "id", "author_id", "title", "content", "post_type", "stray_id", "sighting_id", "location", "media", "like_count", "comment_count", "share_count", "is_published", "published_at", "updated_at" FROM `community_posts`;--> statement-breakpoint
DROP TABLE `community_posts`;--> statement-breakpoint
ALTER TABLE `__new_community_posts` RENAME TO `community_posts`;--> statement-breakpoint
CREATE TABLE `__new_sightings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`location` text,
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
CREATE TABLE `__new_stray_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`stray_id` integer,
	`location` text,
	`notification_preferences` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_stray_subscriptions`("id", "user_id", "stray_id", "location", "notification_preferences", "is_active", "created_at") SELECT "id", "user_id", "stray_id", "location", "notification_preferences", "is_active", "created_at" FROM `stray_subscriptions`;--> statement-breakpoint
DROP TABLE `stray_subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_stray_subscriptions` RENAME TO `stray_subscriptions`;--> statement-breakpoint
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
	`description` text,
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
ALTER TABLE `__new_strays` RENAME TO `strays`;