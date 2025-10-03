-- =====================================================
-- INSAPP V3 - Customer Service Platform Database Schema
-- =====================================================
-- Complete database schema for Instagram DM, Comments & WhatsApp integration
-- Generated: 2025-10-03
-- 
-- This file contains the complete database structure for the
-- Customer Service Platform with Instagram and WhatsApp integration.
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS `insapp_v3` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `insapp_v3`;

-- =====================================================
-- TABLE: SystemUser
-- Purpose: User management and authentication
-- =====================================================
CREATE TABLE `SystemUser` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user','viewer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastLogin` datetime(3) DEFAULT NULL,
  `profilePicture` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SystemUser_username_key` (`username`),
  UNIQUE KEY `SystemUser_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: InstagramMessage
-- Purpose: Instagram Direct Messages storage
-- =====================================================
CREATE TABLE `InstagramMessage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(3) NOT NULL,
  `messageType` enum('text','image','video','audio','file') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `mediaUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isFromBusiness` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('sent','delivered','read','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `InstagramMessage_conversationId_idx` (`conversationId`),
  KEY `InstagramMessage_senderId_idx` (`senderId`),
  KEY `InstagramMessage_timestamp_idx` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: InstagramComment
-- Purpose: Instagram Comments and Replies storage
-- =====================================================
CREATE TABLE `InstagramComment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(3) NOT NULL,
  `isReply` tinyint(1) NOT NULL DEFAULT '0',
  `isFromBusiness` tinyint(1) NOT NULL DEFAULT '0',
  `likeCount` int NOT NULL DEFAULT '0',
  `replyCount` int NOT NULL DEFAULT '0',
  `isHidden` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `InstagramComment_postId_idx` (`postId`),
  KEY `InstagramComment_parentId_idx` (`parentId`),
  KEY `InstagramComment_userId_idx` (`userId`),
  KEY `InstagramComment_timestamp_idx` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: InstagramPost
-- Purpose: Instagram Posts metadata
-- =====================================================
CREATE TABLE `InstagramPost` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` text COLLATE utf8mb4_unicode_ci,
  `mediaType` enum('IMAGE','VIDEO','CAROUSEL_ALBUM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mediaUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permalink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL,
  `likeCount` int NOT NULL DEFAULT '0',
  `commentCount` int NOT NULL DEFAULT '0',
  `isPublished` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `InstagramPost_timestamp_idx` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: WhatsAppMessage
-- Purpose: WhatsApp Business Messages storage
-- =====================================================
CREATE TABLE `WhatsAppMessage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `messageType` enum('text','image','audio','video','document','location','contact') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `mediaUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL,
  `status` enum('sent','delivered','read','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `isFromBusiness` tinyint(1) NOT NULL DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `WhatsAppMessage_conversationId_idx` (`conversationId`),
  KEY `WhatsAppMessage_senderId_idx` (`senderId`),
  KEY `WhatsAppMessage_timestamp_idx` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: WhatsAppContact
-- Purpose: WhatsApp Contacts management
-- =====================================================
CREATE TABLE `WhatsAppContact` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profilePicture` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastMessageAt` datetime(3) DEFAULT NULL,
  `lastMessage` text COLLATE utf8mb4_unicode_ci,
  `unreadCount` int NOT NULL DEFAULT '0',
  `isBlocked` tinyint(1) NOT NULL DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `WhatsAppContact_phoneNumber_key` (`phoneNumber`),
  KEY `WhatsAppContact_lastMessageAt_idx` (`lastMessageAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: QuickReply
-- Purpose: Quick reply templates for customer service
-- =====================================================
CREATE TABLE `QuickReply` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` enum('instagram','whatsapp','all') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `usageCount` int NOT NULL DEFAULT '0',
  `createdBy` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `QuickReply_createdBy_fkey` (`createdBy`),
  CONSTRAINT `QuickReply_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `SystemUser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Instagram Messages performance indexes
CREATE INDEX `idx_instagram_conversation_timestamp` ON `InstagramMessage`(`conversationId`, `timestamp`);
CREATE INDEX `idx_instagram_status_timestamp` ON `InstagramMessage`(`status`, `timestamp`);

-- Instagram Comments performance indexes  
CREATE INDEX `idx_instagram_post_timestamp` ON `InstagramComment`(`postId`, `timestamp`);
CREATE INDEX `idx_instagram_parent_timestamp` ON `InstagramComment`(`parentId`, `timestamp`);

-- WhatsApp Messages performance indexes
CREATE INDEX `idx_whatsapp_conversation_timestamp` ON `WhatsAppMessage`(`conversationId`, `timestamp`);
CREATE INDEX `idx_whatsapp_status_timestamp` ON `WhatsAppMessage`(`status`, `timestamp`);

-- WhatsApp Contacts performance indexes
CREATE INDEX `idx_whatsapp_contact_last_message` ON `WhatsAppContact`(`lastMessageAt` DESC);
CREATE INDEX `idx_whatsapp_contact_unread` ON `WhatsAppContact`(`unreadCount` DESC);

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO `SystemUser` (`username`, `email`, `password`, `role`, `fullName`) VALUES 
('admin', 'admin@insapp.com', '$2b$10$rQJ5qF8qF8qF8qF8qF8qFOK8qF8qF8qF8qF8qF8qF8qF8qF8qF8qF', 'admin', 'System Administrator');

-- Insert sample quick replies
INSERT INTO `QuickReply` (`title`, `message`, `platform`, `category`) VALUES 
('Greeting', 'Hello! Thank you for contacting us. How can we help you today?', 'all', 'greeting'),
('Business Hours', 'Our business hours are Monday-Friday 9AM-6PM. We will respond to your message during business hours.', 'all', 'info'),
('Thank You', 'Thank you for your message. We appreciate your business!', 'all', 'closing');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
