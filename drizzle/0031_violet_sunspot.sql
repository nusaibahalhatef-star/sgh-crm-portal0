CREATE TABLE `patientOtps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`code` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`isUsed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patientOtps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patientResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`resultType` enum('lab','radiology','report') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` varchar(500),
	`doctorName` varchar(255),
	`resultDate` timestamp,
	`status` enum('pending','ready','delivered') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`address` text,
	`age` int,
	`gender` enum('male','female') NOT NULL,
	`email` varchar(320),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE INDEX `patientOtps_phone_idx` ON `patientOtps` (`phone`);--> statement-breakpoint
CREATE INDEX `patientResults_patient_idx` ON `patientResults` (`patientId`);--> statement-breakpoint
CREATE INDEX `patients_phone_idx` ON `patients` (`phone`);