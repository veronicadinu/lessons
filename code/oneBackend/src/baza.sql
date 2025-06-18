DROP DATABASE IF EXISTS `one`;
CREATE DATABASE IF NOT EXISTS `one`;
USE `one`;

CREATE TABLE IF NOT EXISTS `subjects`(
`id` int not null auto_increment,
`nameSubject` varchar(250) not null,
`instructionAi` longtext,
`startDate` varchar(200) not null,
`endDate` varchar(200) not null,
`timePerDay` int not null,
`maxLengthLesson` int ,
`userId` varchar(200) not null,
PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `lessons`(
`id` int not null auto_increment,
`subjectId` int not null,
`title` varchar(250) not null,
`durationMinutes` int not null, 
`date` varchar(200) not null ,
`content` longtext,
`summary` longtext,
`done` boolean ,
PRIMARY KEY(`id`),
FOREIGN KEY (`subjectId`) references `subjects`(`id`) on delete cascade on update cascade
);
CREATE TABLE IF NOT EXISTS `files`(
`id` int not null auto_increment,
`subjectId` int not null,
`content` longtext,
PRIMARY KEY (`id`),
FOREIGN KEY(`subjectId`) references `subjects`(`id`) on delete cascade on update cascade 
);

CREATE TABLE IF NOT EXISTS `quiz` (
`id` int not null auto_increment,
`date` varchar(200) NOT NULL,
`subjectId` int not null,
PRIMARY KEY(`id`),
FOREIGN KEY(`subjectId`) references `subjects`(`id`) on delete cascade on update cascade

);

CREATE TABLE IF NOT EXISTS `questions`(
`id` int not null auto_increment,
`content` longtext not null,
`a` longtext not null,
`b` longtext not null,
`c` longtext not null,
`d` longtext not null,
`correctLetter` text not null,
`answer` text,
`quizId` INT NOT NULL,
PRIMARY KEY (`id`),
foreign key(`quizId`) references `quiz`(`id`) on delete cascade on update cascade



);