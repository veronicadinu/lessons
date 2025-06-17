DROP DATABASE IF EXISTS `one`;
CREATE DATABASE IF NOT EXISTS `one`;
USE `one`;

CREATE TABLE IF NOT EXISTS `subjects`(
`id` INT NOT NULL auto_increment,
`nameSubject` varchar(250) NOT NULL,
`instructionAi` longtext,
`startDate` varchar(200) NOT NULL,
`endDate` varchar(200) NOT NULL,
`timePerDay` INT NOT NULL,
`maxLengthLesson` INT ,
`userId` varchar(200) NOT NULL,
PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `lessons`(
`id` INT NOT NULL auto_increment,
`subjectId` INT NOT NULL,
`title` varchar(250) NOT NULL,
`durationMinutes` INT NOT NULL, 
`date` varchar(200) NOT NULL ,
`content` text,
`summary` text,
`done` boolean ,
PRIMARY KEY(`id`),
FOREIGN KEY (`subjectId`) references `subjects`(`id`) on DELETE CASCADE on update CASCADE
);
CREATE TABLE IF NOT EXISTS `files`(
`id` INT NOT NULL auto_increment,
`subjectId` INT NOT NULL,
`content` longtext,
PRIMARY KEY (`id`),
FOREIGN KEY(`subjectId`) references `subjects`(`id`) on DELETE cascade on update CASCADE 
);