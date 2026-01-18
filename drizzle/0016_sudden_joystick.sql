ALTER TABLE `campaigns` ADD `type` enum('digital','field','awareness','mixed') DEFAULT 'digital' NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `status` enum('draft','active','paused','completed','cancelled') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `plannedBudget` int;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `actualBudget` int;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `currency` varchar(10) DEFAULT 'YER';--> statement-breakpoint
ALTER TABLE `campaigns` ADD `platforms` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `goals` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `targetLeads` int;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `targetBookings` int;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `targetROI` int;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `teamLeaderId` int;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `teamMembers` text;