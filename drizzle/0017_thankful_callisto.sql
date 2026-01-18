CREATE TABLE `task_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileType` varchar(100),
	`fileSize` int,
	`attachmentType` enum('deliverable','reference','other') NOT NULL DEFAULT 'other',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `teamId` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `campaignId` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `category` enum('content','design','ads','seo','social_media','analytics','other') DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `completedAt` timestamp;--> statement-breakpoint
ALTER TABLE `tasks` ADD `estimatedHours` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `actualHours` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `tags` text;