export const MAGIC_RELAYER_FULL_URL = 'https://auth.magic.link';
export const TEST_API_KEY = 'pk_test_123';
export const LIVE_API_KEY = 'pk_live_123';
export const ENCODED_QUERY_PARAMS = 'testqueryparams';
export const MSG_TYPES = (encodedQueryParams = ENCODED_QUERY_PARAMS) => ({
  MAGIC_HANDLE_RESPONSE: `MAGIC_HANDLE_RESPONSE-${encodedQueryParams}`,
  MAGIC_OVERLAY_READY: `MAGIC_OVERLAY_READY-${encodedQueryParams}`,
  MAGIC_SHOW_OVERLAY: `MAGIC_SHOW_OVERLAY-${encodedQueryParams}`,
  MAGIC_HIDE_OVERLAY: `MAGIC_HIDE_OVERLAY-${encodedQueryParams}`,
  MAGIC_HANDLE_REQUEST: `MAGIC_HANDLE_REQUEST-${encodedQueryParams}`,
  MAGIC_HANDLE_EVENT: `MAGIC_HANDLE_EVENT-${encodedQueryParams}`,
});
