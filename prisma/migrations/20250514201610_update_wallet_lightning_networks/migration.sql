-- AlterTable
ALTER TABLE `wallet_lightning_networks` ADD COLUMN `certthumbprint` LONGTEXT NULL,
    ADD COLUMN `macaroon` LONGTEXT NULL,
    ADD COLUMN `rune` LONGTEXT NULL,
    MODIFY `access_token` LONGTEXT NULL,
    MODIFY `refresh_token` LONGTEXT NULL;
