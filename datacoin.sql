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
GRANT ALL PRIVILEGES ON `datacoin` . * TO 'datacoin'@'localhost';
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Location', 'User GPS location edited');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `data`
--

INSERT INTO `data` (`id`, `name`, `price`, `owner_id`, `category_id`) VALUES
(1, 'MyLocation', '100', 1, 1),
(2, 'Location Status', '20', 1, 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `value`, `data_id`) VALUES
(1, 'titleedited', 'some thing', 1),
(2, 'subtitleedited', 'something', 1),
(3, 'undefined', 'SValue', 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `requester_uuid`, `status`, `timestamp`, `data_id`) VALUES
(1, '35fee0fa-ddca-4392-a434-1edc53d25ab7', 'Data validated', 1521178978, 1);

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
  UNIQUE KEY `uuid_UNIQUE` (`uuid`),
  UNIQUE KEY `apiKey_UNIQUE` (`apiKey`),
  KEY `fk_users_roles1_idx` (`roles_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `username`, `password`, `apiKey`, `email`, `country`, `city`, `province`, `yearOfBirth`, `roles_id`, `validated`) VALUES
(1, '5882989f-a4a8-4c94-8409-a68827b335d5', 'John', '81dc9bdb52d04dc20036dbd8313ed055', 'ZuIa7evHrLCFdgUo96lagg91cgPMcD', 'johnedited@smith.ca', 'Canada', 'Laval', 'Quebec', 1990, 1, 1),
(2, '35fee0fa-ddca-4392-a434-1edc53d25ab7', 'Johnny', '81dc9bdb52d04dc20036dbd8313ed055', 'tRYyhRyHyJJf9zYlT0SA1dq5JaPDWO', 'john@smith.com', 'Canada', 'Montreal', 'Quebec', 1970, 1, 1),
(3, 'c6d8548b-21a2-4f34-a373-c7ad07e6bc2f', 'datacoin', 'c78036d23335477b6b339e0b938d74a6', 'QFmzD0qIVCNwPs4dqDRPs8nQPLXLD8', 'john@datacoin.ca', 'Canada', 'Montreal', 'Quebec', 1992, 1, 0),
(4, '2150ab55-5507-4af3-8651-6c8d3a1bdc28', 'tristan', 'c78036d23335477b6b339e0b938d74a6', 'fuQdssqjhUoyJ77ucsriTovMJP4dnL', 'john@datacoin1.ca', 'Canada', 'Montreal', 'Quebec', 1992, 1, 0);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `data`
--
ALTER TABLE `data`
  ADD CONSTRAINT `fk_data_categories1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
