-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 23, 2018 at 02:18 AM
-- Server version: 5.7.21-log
-- PHP Version: 5.6.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `datacoin`
--
DROP DATABASE IF EXISTS `datacoin`;
CREATE DATABASE `datacoin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `datacoin`;

-- --------------------------------------------------------

--
-- User: `datacoin`
CREATE USER IF NOT EXISTS 'datacoin'@'localhost' IDENTIFIED BY 'datacoin';
GRANT ALL PRIVILEGES ON `datacoin`.* TO 'datacoin'@'localhost';
FLUSH PRIVILEGES;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(45) NOT NULL DEFAULT 'N/A',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Location', 'User GPS location edited'),
(3, 'Temperature', 'Temperature record from sensors'),
(4, 'Other', 'Other non categorised data');

-- --------------------------------------------------------

--
-- Table structure for table `data`
--

DROP TABLE IF EXISTS `data`;
CREATE TABLE IF NOT EXISTS `data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL,
  `owner_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  PRIMARY KEY (`id`,`owner_id`,`category_id`),
  KEY `fk_data_users_idx` (`owner_id`),
  KEY `fk_data_categories1_idx` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `data`
--

INSERT INTO `data` (`id`, `name`, `price`, `owner_id`, `category_id`) VALUES
(1, 'MyLocation', '100', 1, 3),
(2, 'Location Status', '20', 2, 1),
(3, 'Name1', '10', 3, 1),
(4, 'Name2', '10', 3, 1),
(5, 'Name3', '10', 3, 1),
(6, 'Temperature', '10', 3, 1),
(7, 'Temperature', '10', 3, 1),
(8, 'Temperature', '10', 3, 1),
(9, 'Temperature', '10', 3, 1),
(10, 'Another Data', '10', 3, 1),
(11, 'Dt', '10', 3, 1),
(12, 'New Data', '102', 3, 1),
(13, 'New2603', '105', 3, 1),
(14, 'TestCategory', '10', 3, 4),
(15, 'wassim', '10', 3, 1),
(16, 'wassim', '10', 3, 1);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL,
  `type` varchar(45) DEFAULT 'user',
  `allowed` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `type`, `allowed`) VALUES
(1, 'user', '{\"pending\":[\"accepted\",\"rejected\"], \"sample uploaded\": \"data validated\"}'),
(2, 'service', '{\"funds on hold\":\"sample uploaded\", \"data validated\": \"data transferred\"}'),
(3, 'manager', '{\"pending\":[\"accepted\",\"rejected\"], \"accepted\": \"funds on hold\", \"funds on hold\":\"sample uploaded\", \"sample uploaded\": \"data validated\", \"data validated\":\"data transferred\",\"data transferred\":\"completed\"}');

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `value` varchar(45) DEFAULT NULL,
  `data_id` int(11) NOT NULL,
  PRIMARY KEY (`id`,`data_id`),
  KEY `fk_tags_data1_idx` (`data_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `value`, `data_id`) VALUES
(1, 'titleedited', 'some thing', 2),
(2, 'subtitleedited', 'something', 1),
(3, 'undefined', 'SValue', 2),
(4, 'undefined', 'undefined', 9),
(5, 'undefined', 'undefined', 10),
(6, 'undefined', 'undefined', 11),
(7, 'For', 'Sale', 12),
(8, 'Tag1', 'tg2', 13),
(9, 'tag2', 'tg1', 12);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_uuid` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `timestamp` int(11) DEFAULT NULL,
  `data_id` int(11) NOT NULL,
  PRIMARY KEY (`id`,`data_id`),
  KEY `fk_transactions_data1_idx` (`data_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `requester_uuid`, `status`, `timestamp`, `data_id`) VALUES
(1, '35fee0fa-ddca-4392-a434-1edc53d25ab7', 'Data validated', 1521178978, 1),
(2, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'Pending', 1522101549, 1),
(3, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'Pending', 1522102012, 1),
(4, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'Pending', 1522102041, 1),
(5, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'Pending', 1522102470, 1),
(6, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'Pending', 1522102557, 2),
(7, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'Pending', 1522102618, 1),
(8, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'Pending', 1522102660, 1),
(9, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'Pending', 1522102948, 1),
(10, 'c6d8548b-21a2-4f34-a373-c7ad07e6bc2f', 'Pending', 1522103043, 1),
(11, 'c6d8548b-21a2-4f34-a373-c7ad07e6bc2f', 'Pending', 1522103634, 1),
(12, 'c6d8548b-21a2-4f34-a373-c7ad07e6bc2f', 'Pending', 1522106558, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(45) DEFAULT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `apiKey` varchar(45) DEFAULT NULL,
  `email` varchar(45) NOT NULL,
  `country` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `province` varchar(45) DEFAULT NULL,
  `yearOfBirth` int(11) DEFAULT NULL,
  `roles_id` int(11) NOT NULL DEFAULT '1',
  `validated` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`,`roles_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `uuid_UNIQUE` (`uuid`),
  UNIQUE KEY `apiKey_UNIQUE` (`apiKey`),
  KEY `fk_users_roles1_idx` (`roles_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `username`, `password`, `apiKey`, `email`, `country`, `city`, `province`, `yearOfBirth`, `roles_id`, `validated`) VALUES
(1, '5882989f-a4a8-4c94-8409-a68827b335d5', 'John', '81dc9bdb52d04dc20036dbd8313ed055', 'ZuIa7evHrLCFdgUo96lagg91cgPMcD', 'johnedited@smith.ca', 'Canada', 'Laval', 'Quebec', 1990, 1, 1),
(2, '35fee0fa-ddca-4392-a434-1edc53d25ab7', 'Johnny', '81dc9bdb52d04dc20036dbd8313ed055', 'tRYyhRyHyJJf9zYlT0SA1dq5JaPDWO', 'john@smith.com', 'Canada', 'Montreal', 'Quebec', 1970, 3, 1),
(3, 'c6d8548b-21a2-4f34-a373-c7ad07e6bc2f', 'datacoin', '979a73428d9179be44f3770b24d71dee', '9dMwqfvjZCu1lICsTJJjMDRgmXucvB', 'john@datacoin.ca', 'Canada', 'Montreal', 'Quebec', 1970, 1, 1),
(4, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'tristan', 'c78036d23335477b6b339e0b938d74a6', 'fuQdssqjhUoyJ77ucsriTovMJP4dnL', 'john@datacoin1.ca', 'Canada', 'Montreal', 'Quebec', 1992, 1, 0),
(5, 'd0193cc1-3c09-43b6-8ee0-f316eab19159', 'wasim', '81dc9bdb52d04dc20036dbd8313ed055', 'tlG4ce4ekaHVs0FIKm6DGfiJBCcW83', 'wassim_sabra@hotmail.com', 'Canada', 'montreal', 'quebec', 1970, 1, 0),
(6, '3f0d6aa9-a926-4880-849b-e6dbb85cfe6a', 'datacoin1', '979a73428d9179be44f3770b24d71dee', 'ofbKxGFhXt70iwJABrv5XEmtDJ3O7s', 'sabra1.entre1prise@live.com', 'Canada', 'montreal', 'quebec', 1970, 1, 0),
(7, '7e20469a-1d8e-42dd-bf12-872a6544a93b', 'wass2', '979a73428d9179be44f3770b24d71dee', 'xCPwTznhaqcKmCERjzmQtSYc82L07B', 's_wer@hot.com', 'Canada', 'montreal', 'quebec', 1970, 1, 0),
(8, '643d1ad5-29c3-40d0-bfb0-13110d617249', 'w_sabr', '7815696ecbf1c96e6894b779456d330e', 'NtBo7X6Nozc3Y7y6NnpNQn9BHfO3mf', 'sabra.entreprise@live.com', 'Canada', 'Saint-Laurent', 'QUEBEC', 1970, 1, 1),
(9, '17497f51-27ee-4e0d-a36b-92c8dbbd1e78', 'w_sabra', '7815696ecbf1c96e6894b779456d330e', 'May2a6mzSkMisBFqgNj4WJX3mazd04', 'sabra.entrepris1e@live.ca', 'Canada', 'Saint-Laurent', 'QUEBEC', 1970, 1, 0),
(10, '7ef4665b-7071-4582-b600-652639021d1a', 'w1_sabra', '7815696ecbf1c96e6894b779456d330e', 'tLp2kIMYqgqZGXqbJZxX2X1ycj39ac', 'sabra.entreprise@live.ca', 'Canada', 'Saint-Laurent', 'QUEBEC', 1970, 1, 0);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `data`
--
ALTER TABLE `data`
  ADD CONSTRAINT `fk_data_categories1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_data_users` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tags`
--
ALTER TABLE `tags`
  ADD CONSTRAINT `fk_tags_data1` FOREIGN KEY (`data_id`) REFERENCES `data` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_data1` FOREIGN KEY (`data_id`) REFERENCES `data` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_roles1` FOREIGN KEY (`roles_id`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
