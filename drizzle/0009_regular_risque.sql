ALTER TABLE `appointments` ADD `age` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `procedure` varchar(255);--> statement-breakpoint
ALTER TABLE `appointments` ADD `additionalNotes` text;--> statement-breakpoint
ALTER TABLE `appointments` ADD `staffNotes` text;--> statement-breakpoint
ALTER TABLE `doctors` ADD `procedures` text;--> statement-breakpoint
ALTER TABLE `doctors` ADD `isVisiting` boolean DEFAULT false NOT NULL;