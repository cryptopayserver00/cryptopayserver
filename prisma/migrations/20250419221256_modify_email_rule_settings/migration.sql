/*
  Warnings:

  - You are about to drop the column `tigger` on the `email_rule_settings` table. All the data in the column will be lost.
  - Added the required column `trigger` to the `email_rule_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `email_rule_settings` DROP COLUMN `tigger`,
    ADD COLUMN `trigger` INTEGER NOT NULL;
