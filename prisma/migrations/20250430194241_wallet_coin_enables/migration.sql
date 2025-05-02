-- CreateTable
CREATE TABLE `wallet_coin_enables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `chain_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `network` INTEGER NOT NULL,
    `enabled` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
