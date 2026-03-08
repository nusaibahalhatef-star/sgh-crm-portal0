CREATE TABLE `abandonedForms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formType` enum('appointment','offer','camp','general') NOT NULL,
	`phone` varchar(32),
	`name` varchar(256),
	`relatedId` int,
	`relatedName` varchar(256),
	`formData` text,
	`source` varchar(64),
	`utmSource` varchar(128),
	`utmCampaign` varchar(256),
	`sessionId` varchar(64),
	`contacted` boolean DEFAULT false,
	`contactedAt` timestamp,
	`converted` boolean DEFAULT false,
	`convertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abandonedForms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trackingEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64),
	`eventType` varchar(64) NOT NULL,
	`page` varchar(512),
	`metadata` text,
	`source` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trackingEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visitSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`source` varchar(64),
	`utmSource` varchar(128),
	`utmMedium` varchar(128),
	`utmCampaign` varchar(256),
	`utmContent` varchar(256),
	`utmTerm` varchar(256),
	`fbclid` varchar(256),
	`gclid` varchar(256),
	`landingPage` varchar(512),
	`referrer` varchar(512),
	`userAgent` text,
	`converted` boolean DEFAULT false,
	`conversionType` varchar(64),
	`conversionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visitSessions_id` PRIMARY KEY(`id`)
);
