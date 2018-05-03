-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 03, 2018 at 03:44 AM
-- Server version: 5.5.59-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `datacoin`
--
DROP DATABASE IF EXISTS `datacoin`;
CREATE DATABASE `datacoin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `datacoin`;

-- --------------------------------------------------------

--
-- User: `datacoin`
DROP USER 'datacoin'@'localhost';
CREATE USER 'datacoin'@'localhost' IDENTIFIED BY 'datacoin';
GRANT ALL PRIVILEGES ON datacoin.* TO 'datacoin'@'localhost';
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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

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
  `added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`owner_id`,`category_id`),
  KEY `fk_data_users_idx` (`owner_id`),
  KEY `fk_data_categories1_idx` (`category_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `data`
--

INSERT INTO `data` (`id`, `name`, `price`, `owner_id`, `category_id`, `added`) VALUES
(1, 'Datacoin1', 10, 2, 1, '2018-05-02 22:44:20'),
(2, 'datacoin', 10, 1, 3, '2018-05-02 22:44:51');

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
(1, 'user', '{"pending":["accepted","rejected"], "sample uploaded": "data validated"}'),
(2, 'service', '{"funds on hold":"sample uploaded", "data validated": "data transferred"}'),
(3, 'manager', '{"pending":["accepted","rejected"], "accepted": "funds on hold", "funds on hold":"sample uploaded", "sample uploaded": "data validated", "data validated":"data transferred","data transferred":"completed"}');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `value`, `data_id`) VALUES
(1, 'Title', 'Hello', 1),
(8, 'Description', 'some description', 2),
(9, 'Average', '10', 2);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_uuid` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `data_id` int(11) NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`data_id`),
  KEY `fk_transactions_data1_idx` (`data_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `requester_uuid`, `status`, `data_id`, `timestamp`) VALUES
(1, 'c3bfbf6f-8991-46c7-a759-707d86cba255', 'data validated', 1, '2018-05-02 22:45:03'),
(2, 'd669d37f-6a37-4a5e-85c1-9510c3fa1cb4', 'accepted', 2, '2018-05-02 22:45:27');

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `username`, `password`, `apiKey`, `email`, `country`, `city`, `province`, `yearOfBirth`, `roles_id`, `validated`) VALUES
(1, 'c3bfbf6f-8991-46c7-a759-707d86cba255', 'datacoin', '979a73428d9179be44f3770b24d71dee', 'DJ2HxNRFPXUA6u83Jw4Aw2fqFVDIFi', 'sabra.entreprise@live.ca', 'Canada', 'Montreal', 'QC', 1991, 1, 1),
(2, 'd669d37f-6a37-4a5e-85c1-9510c3fa1cb4', 'datacoin1', '979a73428d9179be44f3770b24d71dee', 'VxBLliU3LNVP0sYRjv2gqY0shWffPJ', 'sabra.entreprise@live.com', 'Canada', 'Saint-Laurent', 'QUEBEC', 1989, 1, 1);

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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
