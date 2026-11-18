-- Persist outbound webhook attempts for observability and scheduled retries.
CREATE TABLE `webhook_deliveries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `webhook_setting_id` INTEGER NULL,
    `event` VARCHAR(191) NOT NULL,
    `payload_url` TEXT NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `secret` TEXT NOT NULL,
    `delivery_status` VARCHAR(191) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `last_error` TEXT NULL,
    `next_retry_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `webhook_deliveries_delivery_status_next_retry_at_status_idx` ON `webhook_deliveries`(`delivery_status`, `next_retry_at`, `status`);
CREATE INDEX `webhook_deliveries_store_id_delivery_status_status_idx` ON `webhook_deliveries`(`store_id`, `delivery_status`, `status`);
CREATE INDEX `webhook_deliveries_webhook_setting_id_status_idx` ON `webhook_deliveries`(`webhook_setting_id`, `status`);
