-- CreateTable
CREATE TABLE `address_books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `chain_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `network` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `wallet_id` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `private_key` LONGTEXT NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `chain_id` INTEGER NOT NULL,
    `network` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_key_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `permissions` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkout_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `show_payment_confetti` INTEGER NOT NULL,
    `show_sound` INTEGER NOT NULL,
    `show_pay_in_wallet_button` INTEGER NOT NULL,
    `show_detect_language` INTEGER NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `custom_html_title` VARCHAR(191) NOT NULL,
    `support_url` VARCHAR(191) NOT NULL,
    `show_payment_method` INTEGER NOT NULL,
    `show_redirect_url` INTEGER NOT NULL,
    `show_public_receipt_page` INTEGER NOT NULL,
    `show_payment_list` INTEGER NOT NULL,
    `show_qrcode_receipt` INTEGER NOT NULL,
    `show_header` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crowdfunds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_rule_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `tigger` INTEGER NOT NULL,
    `recipients` VARCHAR(191) NOT NULL,
    `show_send_to_buyer` INTEGER NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `smtp_server` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL,
    `sender_email` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `show_tls` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NOT NULL,
    `order_id` BIGINT NOT NULL,
    `message` LONGTEXT NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `chain_id` INTEGER NOT NULL,
    `network` INTEGER NOT NULL,
    `order_id` BIGINT NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `crypto` VARCHAR(191) NOT NULL,
    `crypto_amount` DOUBLE NOT NULL,
    `rate` DOUBLE NOT NULL,
    `description` LONGTEXT NULL,
    `buyer_email` VARCHAR(191) NULL,
    `order_status` VARCHAR(191) NOT NULL,
    `payment_method` VARCHAR(191) NULL,
    `destination_address` VARCHAR(191) NOT NULL,
    `paid` INTEGER NOT NULL,
    `metadata` LONGTEXT NULL,
    `notification_url` VARCHAR(191) NULL,
    `notification_email` VARCHAR(191) NULL,
    `match_tx_id` INTEGER NULL,
    `external_payment_id` BIGINT NOT NULL,
    `source_type` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `expiration_at` DATETIME(3) NOT NULL,
    `hash` VARCHAR(191) NULL,
    `from_address` VARCHAR(191) NULL,
    `to_address` VARCHAR(191) NULL,
    `block_timestamp` BIGINT NULL,

    UNIQUE INDEX `invoices_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `notifications` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `network` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `is_seen` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pay_buttons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `network` INTEGER NOT NULL,
    `payment_request_id` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `show_allow_custom_amount` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `request_customer_data` VARCHAR(191) NOT NULL,
    `memo` LONGTEXT NOT NULL,
    `payment_request_status` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `expiration_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_requests_payment_request_id_key`(`payment_request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `chain_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `payment_expire` INTEGER NOT NULL,
    `confirm_block` INTEGER NOT NULL,
    `show_recommended_fee` INTEGER NOT NULL,
    `current_used_address_id` INTEGER NOT NULL,
    `network` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payout_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `chain_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `show_approve_payout_process` INTEGER NOT NULL,
    `interval` INTEGER NOT NULL,
    `fee_block_target` INTEGER NOT NULL,
    `threshold` INTEGER NOT NULL,
    `network` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payouts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `chain_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `payout_id` BIGINT NOT NULL,
    `external_payment_id` BIGINT NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `source_type` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `crypto` VARCHAR(191) NOT NULL,
    `crypto_amount` DOUBLE NULL,
    `payout_status` VARCHAR(191) NOT NULL,
    `tx` VARCHAR(191) NULL,
    `network` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payouts_payout_id_key`(`payout_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `point_of_sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pull_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `network` INTEGER NOT NULL,
    `pull_payment_id` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `show_auto_approve_claim` INTEGER NOT NULL,
    `payout_method` VARCHAR(191) NULL,
    `description` LONGTEXT NOT NULL,
    `pull_payment_status` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `expiration_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pull_payments_pull_payment_id_key`(`pull_payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `shop_name` VARCHAR(191) NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `admin_api_access_token` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `price_source` VARCHAR(191) NOT NULL,
    `brand_color` VARCHAR(191) NOT NULL,
    `logo_url` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NOT NULL,
    `custom_css_url` VARCHAR(191) NOT NULL,
    `allow_anyone_create_invoice` INTEGER NOT NULL,
    `add_additional_fee_to_invoice` INTEGER NOT NULL,
    `invoice_expires_if_not_paid_full_amount` INTEGER NOT NULL,
    `invoice_paid_less_than_precent` INTEGER NOT NULL,
    `minimum_expiraion_time_for_refund` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `profile_picture_url` VARCHAR(191) NOT NULL,
    `authenticator` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mnemonic` VARCHAR(191) NOT NULL,
    `is_backup` INTEGER NOT NULL,
    `is_generate` INTEGER NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `store_id` INTEGER NOT NULL,
    `payload_url` VARCHAR(191) NOT NULL,
    `secret` VARCHAR(191) NOT NULL,
    `automatic_redelivery` INTEGER NOT NULL,
    `enabled` INTEGER NOT NULL,
    `event_type` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
