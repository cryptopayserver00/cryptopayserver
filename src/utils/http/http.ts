export class Http {
  static baseApiPath = '/api'

  // test
  static test_db_conn = this.baseApiPath + '/test/test_db_conn'

  // user
  static find_user_by_email = this.baseApiPath + '/user/find_user_by_email'
  static find_user_by_userid = this.baseApiPath + '/user/find_user_by_userid'
  static update_user_by_userid = this.baseApiPath + '/user/update_user_by_userid'
  static update_user_password_by_userid = this.baseApiPath + '/user/update_user_password_by_userid'
  static delete_user_by_userid = this.baseApiPath + '/user/delete_user_by_userid'
  static create_user = this.baseApiPath + '/user/create_user'
  static login = this.baseApiPath + '/user/login'
  static send_reset_email = this.baseApiPath + '/user/send_reset_email'

  // apikey
  static find_apikey_setting = this.baseApiPath + '/apikey/find_apikey_setting'
  static create_apikey_setting = this.baseApiPath + '/apikey/create_apikey_setting'
  static delete_apikey_setting_by_id = this.baseApiPath + '/apikey/delete_apikey_setting_by_id'

  // role
  static find_role = this.baseApiPath + '/role/find_role'
  static create_role = this.baseApiPath + '/role/create_role'
  static update_role_by_id = this.baseApiPath + '/role/update_role_by_id'
  static delete_role_by_id = this.baseApiPath + '/role/delete_role_by_id'

  // user role
  static find_user_roles = this.baseApiPath + '/userrole/find_user_role'
  static create_user_roles = this.baseApiPath + '/userrole/create_user_role'
  static update_userrole_by_id = this.baseApiPath + '/userrole/update_userrole_by_id'
  static delete_user_role_by_id = this.baseApiPath + '/userrole/delete_user_role_by_id'

  // store
  static find_store = this.baseApiPath + '/store/find_store'
  static find_store_by_id = this.baseApiPath + '/store/find_store_by_id'
  static create_store = this.baseApiPath + '/store/create_store'
  static update_store_by_id = this.baseApiPath + '/store/update_store_by_id'
  static archive_store_by_id = this.baseApiPath + '/store/archive_store_by_id'
  static delete_store_by_id = this.baseApiPath + '/store/delete_store_by_id'
  static fint_store_stat = this.baseApiPath + '/store/fint_store_stat'

  // address book of store
  static find_address_book = this.baseApiPath + '/store/addressbook/find_address_book'
  static find_address_book_by_id = this.baseApiPath + '/store/addressbook/find_address_book_by_id'
  static update_address_book_by_id =
    this.baseApiPath + '/store/addressbook/update_address_book_by_id'
  static create_address_book = this.baseApiPath + '/store/addressbook/create_address_book'
  static delete_address_book_by_id =
    this.baseApiPath + '/store/addressbook/delete_address_book_by_id'

  // notification setting of store
  static find_notification_setting = this.baseApiPath + '/setting/find_notification_setting'
  static update_notification_setting = this.baseApiPath + '/setting/update_notification_setting'

  // checkout setting of store
  static find_checkout_setting_by_id = this.baseApiPath + '/setting/find_checkout_setting_by_id'
  static update_checkout_setting_by_id = this.baseApiPath + '/setting/update_checkout_setting_by_id'

  // webhook setting of store
  static find_webhook_setting = this.baseApiPath + '/setting/find_webhook_setting'
  static find_webhook_setting_by_id = this.baseApiPath + '/setting/find_webhook_setting_by_id'
  static update_webhook_setting_by_id = this.baseApiPath + '/setting/update_webhook_setting_by_id'
  static create_webhook_setting = this.baseApiPath + '/setting/create_webhook_setting'
  static delete_webhook_setting_by_id = this.baseApiPath + '/setting/delete_webhook_setting_by_id'

  // payout setting of store
  static find_payout_setting = this.baseApiPath + '/setting/find_payout_setting'
  static find_payout_setting_by_id = this.baseApiPath + '/setting/find_payout_setting_by_id'
  static update_payout_setting_by_id = this.baseApiPath + '/setting/update_payout_setting_by_id'

  // email setting of store
  static find_email_setting = this.baseApiPath + '/setting/find_email_setting'
  static update_email_setting = this.baseApiPath + '/setting/update_email_setting'
  static create_email_setting = this.baseApiPath + '/setting/create_email_setting'
  static test_email_setting = this.baseApiPath + '/setting/test_email_setting'

  // email rule setting of store
  static find_email_rule_setting = this.baseApiPath + '/setting/find_email_rule_setting'
  static update_email_rule_setting = this.baseApiPath + '/setting/update_email_rule_setting'
  static create_email_rule_setting = this.baseApiPath + '/setting/create_email_rule_setting'
  static delete_email_rule_setting_by_id =
    this.baseApiPath + '/setting/delete_email_rule_setting_by_id'

  // payment setting
  static find_payment_setting_by_chain_id =
    this.baseApiPath + '/setting/find_payment_setting_by_chain_id'
  static update_payment_setting_by_id = this.baseApiPath + '/setting/update_payment_setting_by_id'

  // wallet
  static find_wallet = this.baseApiPath + '/wallet/find_wallet'
  static find_wallet_by_id = this.baseApiPath + '/wallet/find_wallet_by_id'
  static create_wallet = this.baseApiPath + '/wallet/create_wallet'
  static update_pwd_by_wallet_id = this.baseApiPath + '/wallet/update_pwd_by_wallet_id'
  static update_backup_by_wallet_id = this.baseApiPath + '/wallet/update_backup_by_wallet_id'
  static update_name_by_wallet_id = this.baseApiPath + '/wallet/update_name_by_wallet_id'
  static save_wallet = this.baseApiPath + '/wallet/save_wallet'
  static save_wallet_by_private_key = this.baseApiPath + '/wallet/save_wallet_by_private_key'
  static find_wallet_balance_by_network =
    this.baseApiPath + '/wallet/find_wallet_balance_by_network'
  static find_wallet_address_by_chain_and_network =
    this.baseApiPath + '/wallet/find_wallet_address_by_chain_and_network'
  static find_wallet_address_by_network =
    this.baseApiPath + '/wallet/find_wallet_address_by_network'
  static create_wallet_to_block_scan = this.baseApiPath + '/wallet/create_wallet_to_block_scan'
  static find_private_key_by_chain_and_network =
    this.baseApiPath + '/wallet/find_private_key_by_chain_and_network'
  static find_wallet_coin_enables = this.baseApiPath + '/wallet/find_wallet_coin_enables'
  static update_wallet_coin_enable_by_id =
    this.baseApiPath + '/wallet/update_wallet_coin_enable_by_id'
  static find_wallet_manage_by_network = this.baseApiPath + '/wallet/find_wallet_manage_by_network'

  // lightning network
  static find_lightning_network = this.baseApiPath + '/lightningnetwork/find_lightning_network'
  static test_connection = this.baseApiPath + '/lightningnetwork/test_connection'
  static create_lightning_network = this.baseApiPath + '/lightningnetwork/create_lightning_network'
  static update_lightning_network_setting_by_id =
    this.baseApiPath + '/lightningnetwork/update_lightning_network_setting_by_id'
  static send_lightning_network_transaction =
    this.baseApiPath + '/lightningnetwork/send_lightning_network_transaction'

  // ethereum
  static find_nonce = this.baseApiPath + '/ethereum/find_nonce'
  static find_gas_limit = this.baseApiPath + '/ethereum/find_gas_limit'
  static find_max_priorty_fee = this.baseApiPath + '/ethereum/find_max_priorty_fee'

  // tron
  static find_account_resource = this.baseApiPath + '/tron/find_account_resource'

  // xrp
  static find_token_trust_line = this.baseApiPath + '/xrp/find_token_trust_line'
  static create_token_trust_line = this.baseApiPath + '/xrp/create_token_trust_line'

  // transaction
  static find_transaction = this.baseApiPath + '/transaction/find_transaction'
  static send_transaction = this.baseApiPath + '/transaction/send_transaction'

  // invoice
  static create_invoice_from_external = this.baseApiPath + '/invoice/create_invoice_from_external'
  static create_invoice = this.baseApiPath + '/invoice/create_invoice'
  static find_invoice = this.baseApiPath + '/invoice/find_invoice'
  static find_invoice_by_id = this.baseApiPath + '/invoice/find_invoice_by_id'
  static find_invoice_by_store_id = this.baseApiPath + '/invoice/find_invoice_by_store_id'
  static update_invoice_order_status_by_order_id =
    this.baseApiPath + '/invoice/update_invoice_order_status_by_order_id'
  static find_invoice_by_source_type = this.baseApiPath + '/invoice/find_invoice_by_source_type'
  static create_invoice_event = this.baseApiPath + '/invoice/create_invoice_event'
  static find_invoice_event_by_order_id =
    this.baseApiPath + '/invoice/find_invoice_event_by_order_id'

  // notification
  static find_notification = this.baseApiPath + '/notification/find_notification'
  static create_notification = this.baseApiPath + '/notification/create_notification'
  static update_notification = this.baseApiPath + '/notification/update_notification'

  //plugin shopify
  static find_shopify_setting = this.baseApiPath + '/shopify/find_shopify_setting'
  static update_shopify_setting = this.baseApiPath + '/shopify/update_shopify_setting'
  static create_shopify_setting = this.baseApiPath + '/shopify/create_shopify_setting'

  // payment request
  static create_payment_request = this.baseApiPath + '/paymentrequest/create_payment_request'
  static find_payment_request = this.baseApiPath + '/paymentrequest/find_payment_request'
  static find_payment_request_by_id =
    this.baseApiPath + '/paymentrequest/find_payment_request_by_id'
  static update_payment_request_by_id =
    this.baseApiPath + '/paymentrequest/update_payment_request_by_id'

  // pull payment
  static create_pull_payment = this.baseApiPath + '/pullpayment/create_pull_payment'
  static find_pull_payment = this.baseApiPath + '/pullpayment/find_pull_payment'
  static find_pull_payment_by_id = this.baseApiPath + '/pullpayment/find_pull_payment_by_id'
  static update_pull_payment_by_id = this.baseApiPath + '/pullpayment/update_pull_payment_by_id'

  // payout
  static create_payout = this.baseApiPath + '/payout/create_payout'
  static find_payout = this.baseApiPath + '/payout/find_payout'
  static find_payout_by_id = this.baseApiPath + '/payout/find_payout_by_id'
  static update_payout_by_id = this.baseApiPath + '/payout/update_payout_by_id'
  static find_payout_by_source_type = this.baseApiPath + '/payout/find_payout_by_source_type'

  // report
  static find_report = this.baseApiPath + '/report/find_report'

  // free coin
  static get_free_coin = this.baseApiPath + '/coin/get_free_coin'

  // tool
  static find_crypto_price = this.baseApiPath + '/tool/find_crypto_price'
  static find_asset_balance = this.baseApiPath + '/tool/find_asset_balance'
  static checkout_chain_address = this.baseApiPath + '/tool/checkout_chain_address'
  static checkout_chain_address_status = this.baseApiPath + '/tool/checkout_chain_address_status'
  static find_fee_rate = this.baseApiPath + '/tool/find_fee_rate'
  static find_gas_fee = this.baseApiPath + '/tool/find_gas_fee'
  static parse_qrcode_text = this.baseApiPath + '/tool/parse_qrcode_text'
  static upload_file = this.baseApiPath + '/tool/upload_file'

  // schedule
  static schedule_blockscan = this.baseApiPath + '/schedule/schedule_blockscan'
  static schedule_invoice_expired = this.baseApiPath + '/schedule/schedule_invoice_expired'
  static schedule_pull_payment_expired =
    this.baseApiPath + '/schedule/schedule_pull_payment_expired'
  static schedule_payment_request_expired =
    this.baseApiPath + '/schedule/schedule_payment_request_expired'
}
