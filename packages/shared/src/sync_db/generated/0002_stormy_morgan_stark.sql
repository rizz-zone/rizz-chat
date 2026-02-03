PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_thread` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`lastMutatedAt` integer NOT NULL,
	`name` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_thread`("id", "createdAt", "lastMutatedAt", "name") SELECT "id", "createdAt", "lastMutatedAt", "name" FROM `thread`;--> statement-breakpoint
DROP TABLE `thread`;--> statement-breakpoint
ALTER TABLE `__new_thread` RENAME TO `thread`;--> statement-breakpoint
PRAGMA foreign_keys=ON;