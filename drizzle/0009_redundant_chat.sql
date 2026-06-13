PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_community_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_id` text NOT NULL,
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
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `community_posts_published_at_idx` ON `community_posts` (`published_at`);--> statement-breakpoint
CREATE TABLE `__new_post_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`author_id` text NOT NULL,
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
INSERT INTO `__new_post_comments`("id", "post_id", "author_id", "parent_id", "content", "like_count", "is_edited", "created_at", "updated_at") SELECT "id", "post_id", "author_id", "parent_id", "content", "like_count", "is_edited", "created_at", "updated_at" FROM `post_comments`;--> statement-breakpoint
DROP TABLE `post_comments`;--> statement-breakpoint
ALTER TABLE `__new_post_comments` RENAME TO `post_comments`;--> statement-breakpoint
CREATE INDEX `post_comments_post_id_idx` ON `post_comments` (`post_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_reactions_post_user_idx` ON `post_reactions` (`post_id`,`user_id`);