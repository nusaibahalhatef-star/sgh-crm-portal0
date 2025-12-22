CREATE TABLE `campRegistrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`age` int,
	`medicalCondition` text,
	`notes` text,
	`status` enum('pending','confirmed','attended','cancelled') NOT NULL DEFAULT 'pending',
	`statusNotes` text,
	`source` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campRegistrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offerLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`notes` text,
	`status` enum('new','contacted','booked','not_interested','no_answer') NOT NULL DEFAULT 'new',
	`statusNotes` text,
	`source` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offerLeads_id` PRIMARY KEY(`id`)
);
