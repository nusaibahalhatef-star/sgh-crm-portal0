ALTER TABLE `doctors` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `experience` varchar(255);--> statement-breakpoint
ALTER TABLE `doctors` ADD `languages` varchar(255);--> statement-breakpoint
ALTER TABLE `doctors` ADD `consultationFee` varchar(100);--> statement-breakpoint
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_slug_unique` UNIQUE(`slug`);