-- AlterTable
ALTER TABLE `invoices` ADD COLUMN `lightning_invoice` LONGTEXT NULL,
    ADD COLUMN `lightning_url` LONGTEXT NULL;
