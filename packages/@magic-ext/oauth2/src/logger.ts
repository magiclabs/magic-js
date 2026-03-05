/**
 * Datadog browser-logs logger for the oauth2 extension.
 *
 * Uses the official @datadog/browser-logs SDK, which is bundled into the extension
 * output (excluded from externals). The client token is browser-safe (write-only).
 * The SDK automatically captures network.client.ip server-side from the request source IP.
 */

import { datadogLogs } from '@datadog/browser-logs';

const DATADOG_CLIENT_TOKEN = 'pub6843da41b336b49cfed0626f60a8ff68';
const SERVICE = 'magic-oauth2-extension';

datadogLogs.init({
  clientToken: DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: SERVICE,
  sessionSampleRate: 100,
  forwardErrorsToLogs: false,
  usePartitionedCrossSiteSessionCookie: true,
  useSecureSessionCookie: true,
});

export type LogContext = Record<string, unknown>;

export const logger = {
  info: (message: string, context?: LogContext) => datadogLogs.logger.info(message, context),
  warn: (message: string, context?: LogContext) => datadogLogs.logger.warn(message, context),
  error: (message: string, context?: LogContext) => datadogLogs.logger.error(message, context),
};
