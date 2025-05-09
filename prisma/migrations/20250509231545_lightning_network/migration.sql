-- CreateTable
CREATE TABLE `wallet_lightning_networks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `server` VARCHAR(191) NOT NULL,
    `access_token` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NOT NULL,
    `enabled` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_lightning_network_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lnd_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `show_amount_satoshis` INTEGER NOT NULL,
    `show_hop_hint` INTEGER NOT NULL,
    `show_unify_url_and_qrcode` INTEGER NOT NULL,
    `show_lnurl` INTEGER NOT NULL,
    `show_lnurl_classic_mode` INTEGER NOT NULL,
    `show_allow_payee_pass_comment` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
