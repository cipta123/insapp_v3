-- AlterTable
ALTER TABLE `instagrammessage` ADD COLUMN `replyToId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `InstagramMessage` ADD CONSTRAINT `InstagramMessage_replyToId_fkey` FOREIGN KEY (`replyToId`) REFERENCES `InstagramMessage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
