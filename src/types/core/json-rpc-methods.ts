/**
 * Enum of Fortmatic custom JSON RPC methods. These are used for communication
 * with the Fortmatic provider and as such are not part of the Web3 standard
 * spec.
 */
export enum FmPayloadMethod {
  // --- Ethereum

  fm_composeSend = 'fm_composeSend',
  fm_logout = 'fm_logout',
  fm_get_balances = 'fm_get_balances',
  fm_get_transactions = 'fm_get_transactions',
  fm_is_logged_in = 'fm_is_logged_in',
  fm_accountSettings = 'fm_accountSettings',
  fm_deposit = 'fm_deposit',
  fm_get_user = 'fm_get_user',
  fm_configure = 'fm_configure',

  // --- Auth

  fm_auth_login_with_magic_link = 'fm_auth_login_with_magic_link',
  fm_auth_get_access_token = 'fm_auth_get_access_token',
  fm_auth_get_metadata = 'fm_auth_get_metadata',
  fm_auth_logout = 'fm_auth_logout',
}
