-- Hot-path lookups for API keys, invoice timelines, and wallet coin toggles
CREATE INDEX `api_key_settings_api_key_status_idx` ON `api_key_settings`(`api_key`, `status`);
CREATE INDEX `api_key_settings_store_id_status_idx` ON `api_key_settings`(`store_id`, `status`);

CREATE INDEX `invoice_events_order_id_status_idx` ON `invoice_events`(`order_id`, `status`);
CREATE INDEX `invoice_events_invoice_id_status_idx` ON `invoice_events`(`invoice_id`, `status`);

CREATE INDEX `wallet_coin_enables_store_id_network_status_idx` ON `wallet_coin_enables`(`store_id`, `network`, `status`);
CREATE INDEX `wallet_coin_enables_user_id_store_id_chain_id_network_status_idx` ON `wallet_coin_enables`(`user_id`, `store_id`, `chain_id`, `network`, `status`);

CREATE INDEX `email_settings_store_id_status_idx` ON `email_settings`(`store_id`, `status`);
CREATE INDEX `webhook_settings_store_id_status_idx` ON `webhook_settings`(`store_id`, `status`);
CREATE INDEX `webhook_settings_store_id_enabled_status_idx` ON `webhook_settings`(`store_id`, `enabled`, `status`);
CREATE INDEX `roles_store_id_status_idx` ON `roles`(`store_id`, `status`);
CREATE INDEX `user_roles_store_id_status_idx` ON `user_roles`(`store_id`, `status`);
CREATE INDEX `user_roles_email_status_idx` ON `user_roles`(`email`, `status`);

CREATE INDEX `wallet_lightning_networks_store_id_status_idx` ON `wallet_lightning_networks`(`store_id`, `status`);
CREATE INDEX `wallet_lightning_networks_store_id_enabled_status_idx` ON `wallet_lightning_networks`(`store_id`, `enabled`, `status`);
