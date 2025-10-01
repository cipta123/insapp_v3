-- AlterTable
ALTER TABLE `instagrammessage` ADD COLUMN `mediaId` VARCHAR(191) NULL,
    ADD COLUMN `mediaType` VARCHAR(191) NULL,
    ADD COLUMN `mediaUrl` VARCHAR(191) NULL,
    MODIFY `text` TEXT NULL;
