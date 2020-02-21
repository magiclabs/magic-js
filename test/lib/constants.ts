export const MAGIC_RELAYER_FULL_URL = 'https://fortmatic.com/';
export const TEST_API_KEY = 'pk_test_123';
export const LIVE_API_KEY = 'pk_live_123';
export const ENCODED_QUERY_PARAMS = 'testqueryparams';
export const MSG_TYPES = (encodedQueryParams = ENCODED_QUERY_PARAMS) => ({
  MAGIC_HANDLE_RESPONSE: `FORTMATIC_HANDLE_RESPONSE-${encodedQueryParams}`,
  MAGIC_OVERLAY_READY: `FORTMATIC_OVERLAY_READY-${encodedQueryParams}`,
  MAGIC_SHOW_OVERLAY: `FORTMATIC_SHOW_OVERLAY-${encodedQueryParams}`,
  MAGIC_HIDE_OVERLAY: `FORTMATIC_HIDE_OVERLAY-${encodedQueryParams}`,
  MAGIC_HANDLE_BATCH_REQUEST: `FORTMATIC_HANDLE_BATCH_REQUEST-${encodedQueryParams}`,
  MAGIC_HANDLE_REQUEST: `FORTMATIC_HANDLE_REQUEST-${encodedQueryParams}`,
  MAGIC_HANDLE_FORTMATIC_REQUEST: `FORTMATIC_HANDLE_FORTMATIC_REQUEST-${encodedQueryParams}`,
});
