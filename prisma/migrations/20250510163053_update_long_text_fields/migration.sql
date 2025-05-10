-- AlterTable
ALTER TABLE `wallet_lightning_networks` MODIFY `server` LONGTEXT NOT NULL,
    MODIFY `access_token` LONGTEXT NOT NULL,
    MODIFY `refresh_token` LONGTEXT NOT NULL;
