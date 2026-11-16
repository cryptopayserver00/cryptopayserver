-- Fix expiration_at: was incorrectly marked as @updatedAt (auto-bumped on every row update)
-- MySQL: dropping ON UPDATE CURRENT_TIMESTAMP if present is handled by MODIFY without ON UPDATE.
ALTER TABLE `invoices` MODIFY `expiration_at` DATETIME(3) NOT NULL;
ALTER TABLE `payment_requests` MODIFY `expiration_at` DATETIME(3) NOT NULL;
ALTER TABLE `pull_payments` MODIFY `expiration_at` DATETIME(3) NOT NULL;

-- Hot-path indexes for schedule scans, wallet lookups, and tenant scoping
CREATE INDEX `addresses_wallet_id_chain_id_network_status_idx` ON `addresses`(`wallet_id`, `chain_id`, `network`, `status`);
CREATE INDEX `addresses_user_id_status_idx` ON `addresses`(`user_id`, `status`);

CREATE INDEX `invoices_order_status_status_idx` ON `invoices`(`order_status`, `status`);
CREATE INDEX `invoices_store_id_status_idx` ON `invoices`(`store_id`, `status`);
CREATE INDEX `invoices_user_id_store_id_idx` ON `invoices`(`user_id`, `store_id`);
CREATE INDEX `invoices_expiration_at_order_status_status_idx` ON `invoices`(`expiration_at`, `order_status`, `status`);

CREATE INDEX `notifications_user_id_store_id_status_idx` ON `notifications`(`user_id`, `store_id`, `status`);
CREATE INDEX `notifications_user_id_is_seen_status_idx` ON `notifications`(`user_id`, `is_seen`, `status`);

CREATE INDEX `payment_requests_store_id_status_idx` ON `payment_requests`(`store_id`, `status`);
CREATE INDEX `payment_requests_user_id_store_id_status_idx` ON `payment_requests`(`user_id`, `store_id`, `status`);
CREATE INDEX `payment_requests_expiration_at_payment_request_status_status_idx` ON `payment_requests`(`expiration_at`, `payment_request_status`, `status`);

CREATE INDEX `payment_settings_store_id_chain_id_network_status_idx` ON `payment_settings`(`store_id`, `chain_id`, `network`, `status`);
CREATE INDEX `payment_settings_user_id_store_id_status_idx` ON `payment_settings`(`user_id`, `store_id`, `status`);

CREATE INDEX `pull_payments_store_id_status_idx` ON `pull_payments`(`store_id`, `status`);
CREATE INDEX `pull_payments_user_id_store_id_status_idx` ON `pull_payments`(`user_id`, `store_id`, `status`);
CREATE INDEX `pull_payments_expiration_at_pull_payment_status_status_idx` ON `pull_payments`(`expiration_at`, `pull_payment_status`, `status`);

CREATE INDEX `wallets_user_id_store_id_status_idx` ON `wallets`(`user_id`, `store_id`, `status`);
CREATE INDEX `wallets_store_id_status_idx` ON `wallets`(`store_id`, `status`);
