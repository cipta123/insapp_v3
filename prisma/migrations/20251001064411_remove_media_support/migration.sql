/*
  Warnings:

  - You are about to drop the column `mediaId` on the `instagrammessage` table. All the data in the column will be lost.
  - You are about to drop the column `mediaType` on the `instagrammessage` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrl` on the `instagrammessage` table. All the data in the column will be lost.
  - Made the column `text` on table `instagrammessage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `instagrammessage` DROP COLUMN `mediaId`,
    DROP COLUMN `mediaType`,
    DROP COLUMN `mediaUrl`,
    MODIFY `text` TEXT NOT NULL;
