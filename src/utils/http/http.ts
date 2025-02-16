import { IS_DEVELOPMENT } from 'packages/constants';

export class Http {
  static httpPath = IS_DEVELOPMENT ? 'http://127.0.0.1:8888/api' : 'https://cryptopayserver.xyz/api';

  // test
  static test_db_conn = this.httpPath + '/test/test_db_conn';

  // user
  static find_user_by_email = this.httpPath + '/user/find_user_by_email';
  static update_user_by_email = this.httpPath + '/user/update_user_by_email';
  static update_user_password_by_email = this.httpPath + '/user/update_user_password_by_email';
  static delete_user_by_email = this.httpPath + '/user/delete_user_by_email';
  static create_user = this.httpPath + '/user/create_user';
  static login = this.httpPath + '/user/login';

  // apikeys
  static find_apikeys_setting = this.httpPath + '/apikeys/find_apikeys_setting';
  static create_apikeys_setting = this.httpPath + '/apikeys/create_apikeys_setting';
  static delete_apikeys_setting_by_id = this.httpPath + '/apikeys/delete_apikeys_setting_by_id';

  // store
  static find_store = this.httpPath + '/store/find_store';
  static find_store_by_id = this.httpPath + '/store/find_store_by_id';
  static create_store = this.httpPath + '/store/create_store';
  static update_store_by_id = this.httpPath + '/store/update_store_by_id';
  static archive_store_by_id = this.httpPath + '/store/archive_store_by_id';
  static delete_store_by_id = this.httpPath + '/store/delete_store_by_id';

  // notification setting of store
  static find_notification_setting = this.httpPath + '/setting/find_notification_setting';
  static update_notification_setting = this.httpPath + '/setting/update_notification_setting';

  // checkout setting of store
  static find_checkout_setting_by_id = this.httpPath + '/setting/find_checkout_setting_by_id';
  static update_checkout_setting_by_id = this.httpPath + '/setting/update_checkout_setting_by_id';

  // webhook setting of store
  static find_webhook_setting = this.httpPath + '/setting/find_webhook_setting';
  static find_webhook_setting_by_id = this.httpPath + '/setting/find_webhook_setting_by_id';
  static update_webhook_setting_by_id = this.httpPath + '/setting/update_webhook_setting_by_id';
  static create_webhook_setting = this.httpPath + '/setting/create_webhook_setting';
  static delete_webhook_setting_by_id = this.httpPath + '/setting/delete_webhook_setting_by_id';

  // payout setting of store
  static find_payout_setting_by_network = this.httpPath + '/setting/find_payout_setting_by_network';
  static update_payout_setting_by_network = this.httpPath + '/setting/update_payout_setting_by_network';

  // email setting of store
  static find_email_setting = this.httpPath + '/setting/find_email_setting';
  static update_email_setting = this.httpPath + '/setting/update_email_setting';
  static create_email_setting = this.httpPath + '/setting/create_email_setting';

  // email rule setting of store
  static find_email_rule_setting = this.httpPath + '/setting/find_email_rule_setting';
  static update_email_rule_setting = this.httpPath + '/setting/update_email_rule_setting';
  static create_email_rule_setting = this.httpPath + '/setting/create_email_rule_setting';

  // payment setting
  static find_payment_setting_by_chain_id = this.httpPath + '/setting/find_payment_setting_by_chain_id';
  static update_payment_setting_by_id = this.httpPath + '/setting/update_payment_setting_by_id';

  // wallet
  static find_wallet = this.httpPath + '/wallet/find_wallet';
  static find_wallet_by_id = this.httpPath + '/wallet/find_wallet_by_id';
  static create_wallet = this.httpPath + '/wallet/create_wallet';
  static update_pwd_by_wallet_id = this.httpPath + '/wallet/update_pwd_by_wallet_id';
  static update_backup_by_wallet_id = this.httpPath + '/wallet/update_backup_by_wallet_id';
  static save_wallet = this.httpPath + '/wallet/save_wallet';
  static find_wallet_balance_by_network = this.httpPath + '/wallet/find_wallet_balance_by_network';
  static find_wallet_address_by_chain_and_network = this.httpPath + '/wallet/find_wallet_address_by_chain_and_network';
  static find_wallet_address_by_network = this.httpPath + '/wallet/find_wallet_address_by_network';
  static create_wallet_to_block_scan = this.httpPath + '/wallet/create_wallet_to_block_scan';

  // ethereum
  static find_nonce = this.httpPath + '/ethereum/find_nonce';
  static find_gas_limit = this.httpPath + '/ethereum/find_gas_limit';
  static find_max_priorty_fee = this.httpPath + '/ethereum/find_max_priorty_fee';

  // transaction
  static find_transaction_by_store_id = this.httpPath + '/transaction/find_transaction_by_store_id';
  static send_transaction = this.httpPath + '/transaction/send_transaction';

  // invoice
  static create_invoice_from_external = this.httpPath + '/invoice/create_invoice_from_external';
  static create_invoice = this.httpPath + '/invoice/create_invoice';
  static find_invoice = this.httpPath + '/invoice/find_invoice';
  static find_invoice_by_id = this.httpPath + '/invoice/find_invoice_by_id';
  static find_invoice_by_store_id = this.httpPath + '/invoice/find_invoice_by_store_id';
  static update_invoice_order_status_by_order_id = this.httpPath + '/invoice/update_invoice_order_status_by_order_id';
  static find_invoice_by_source_type = this.httpPath + '/invoice/find_invoice_by_source_type';
  static create_invoice_event = this.httpPath + '/invoice/create_invoice_event';
  static find_invoice_event_by_order_id = this.httpPath + '/invoice/find_invoice_event_by_order_id';

  // notification
  static find_notification = this.httpPath + '/notification/find_notification';
  static create_notification = this.httpPath + '/notification/create_notification';
  static update_notification = this.httpPath + '/notification/update_notification';

  //plugin shopify
  static find_shopify_setting = this.httpPath + '/shopify/find_shopify_setting';
  static update_shopify_setting = this.httpPath + '/shopify/update_shopify_setting';
  static create_shopify_setting = this.httpPath + '/shopify/create_shopify_setting';

  // payment request
  static create_payment_request = this.httpPath + '/paymentrequest/create_payment_request';
  static find_payment_request = this.httpPath + '/paymentrequest/find_payment_request';
  static find_payment_request_by_id = this.httpPath + '/paymentrequest/find_payment_request_by_id';
  static update_payment_request_by_id = this.httpPath + '/paymentrequest/update_payment_request_by_id';

  // pull payment
  static create_pull_payment = this.httpPath + '/pullpayment/create_pull_payment';
  static find_pull_payment = this.httpPath + '/pullpayment/find_pull_payment';
  static find_pull_payment_by_id = this.httpPath + '/pullpayment/find_pull_payment_by_id';
  static update_pull_payment_by_id = this.httpPath + '/pullpayment/update_pull_payment_by_id';

  // payout
  static create_payout = this.httpPath + '/payout/create_payout';
  static find_payout = this.httpPath + '/payout/find_payout';
  static find_payout_by_id = this.httpPath + '/payout/find_payout_by_id';
  static update_payout_by_id = this.httpPath + '/payout/update_payout_by_id';
  static find_payout_by_source_type = this.httpPath + '/payout/find_payout_by_source_type';

  // report
  static find_report = this.httpPath + '/report/find_report';

  // free coin
  static get_free_coin = this.httpPath + '/coin/get_free_coin';

  // tool
  static find_crypto_price = this.httpPath + '/tool/find_crypto_price';
  static find_asset_balance = this.httpPath + '/tool/find_asset_balance';
  static checkout_chain_address = this.httpPath + '/tool/checkout_chain_address';
  static checkout_chain_address_status = this.httpPath + '/tool/checkout_chain_address_status';
  static find_fee_rate = this.httpPath + '/tool/find_fee_rate';
  static find_gas_fee = this.httpPath + '/tool/find_gas_fee';
}
