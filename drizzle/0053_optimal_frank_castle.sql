ALTER TABLE `campRegistrations` ADD `preferredDate` varchar(20);--> statement-breakpoint
ALTER TABLE `campRegistrations` ADD `preferredTimeSlot` enum('morning','evening');--> statement-breakpoint
ALTER TABLE `camps` ADD `morningTime` varchar(20);--> statement-breakpoint
ALTER TABLE `camps` ADD `eveningTime` varchar(20);--> statement-breakpoint
ALTER TABLE `camps` ADD `dailyCapacity` int;