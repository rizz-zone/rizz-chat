CREATE TABLE `message` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer,
	`content` text,
	`threadId` text,
	FOREIGN KEY (`threadId`) REFERENCES `thread`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `thread` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text
);
