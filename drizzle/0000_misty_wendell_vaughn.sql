CREATE TABLE `bounties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text(200) NOT NULL,
	`description` text NOT NULL,
	`target_location` blob,
	`area_type` text,
	`status` text DEFAULT 'open',
	`priority` text DEFAULT 'medium',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bounty_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracking_request_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`status` text DEFAULT 'assigned',
	`assigned_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tracking_request_id`) REFERENCES `bounties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `care_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`care_type` text NOT NULL,
	`description` text NOT NULL,
	`location` blob,
	`photos` blob,
	`care_date` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_id` integer NOT NULL,
	`title` text(200),
	`content` text NOT NULL,
	`post_type` text DEFAULT 'general',
	`stray_id` integer,
	`sighting_id` integer,
	`location` blob,
	`media` blob,
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
CREATE TABLE `medical_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`record_type` text NOT NULL,
	`description` text NOT NULL,
	`veterinarian` text,
	`cost` real,
	`record_date` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `naming_suggestions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`name` text(50) NOT NULL,
	`description` text,
	`is_selected` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `naming_votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`naming_suggestion_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`vote` integer NOT NULL,
	`voted_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`naming_suggestion_id`) REFERENCES `naming_suggestions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `post_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`author_id` integer NOT NULL,
	`parent_id` integer,
	`content` text NOT NULL,
	`like_count` integer DEFAULT 0,
	`is_edited` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `post_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`reaction_type` text DEFAULT 'like',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sighting_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sighting_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`url` text NOT NULL,
	`file_name` text,
	`file_size` integer,
	`mime_type` text,
	`caption` text,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sighting_id`) REFERENCES `sightings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sightings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`location` blob,
	`description` text,
	`sighting_time` integer,
	`weather_condition` text,
	`confidence` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stray_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stray_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`url` text NOT NULL,
	`file_name` text,
	`file_size` integer,
	`mime_type` text,
	`description` text,
	`is_primary` integer DEFAULT false,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stray_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`stray_id` integer,
	`location` blob,
	`notification_preferences` blob,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stray_id`) REFERENCES `strays`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `strays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`species` text NOT NULL,
	`breed` text,
	`age` text,
	`size` text NOT NULL,
	`colors` blob,
	`markings` blob,
	`status` text DEFAULT 'spotted' NOT NULL,
	`description` text,
	`health_notes` text,
	`care_requirements` text,
	`primary_location` blob,
	`sighting_history` blob,
	`caretaker_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`caretaker_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
