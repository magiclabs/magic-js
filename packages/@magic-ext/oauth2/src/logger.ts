/**
 * Lightweight Datadog logger for the oauth2 extension.
 *
 * Posts directly to the Datadog browser-logs HTTP intake endpoint using fetch —
 * no SDK dependency required. The client token is browser-safe (write-only).
 *
 * Replace DATADOG_CLIENT_TOKEN with the actual Magic Datadog client token
 * (starts with "pub...") before deploying.
 */

// TODO: replace with the real Magic Datadog browser client token
const DATADOG_CLIENT_TOKEN = '__DATADOG_CLIENT_TOKEN__';
const DATADOG_INTAKE_URL = 'https://browser-intake-datadoghq.com/api/v2/logs';
const SERVICE = 'magic-oauth2-extension';

export type LogContext = Record<string, unknown>;

function send(status: 'info' | 'warn' | 'error', message: string, context: LogContext = {}): void {
  if (typeof fetch === 'undefined' || !DATADOG_CLIENT_TOKEN || DATADOG_CLIENT_TOKEN === '__DATADOG_CLIENT_TOKEN__') {
    return;
  }

  const entry = {
    ddsource: 'browser',
    service: SERVICE,
    status,
    message,
    date: Date.now(),
    'http.useragent': typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    'page.origin': typeof window !== 'undefined' ? window.location.origin : undefined,
    ...context,
  };

  const url = `${DATADOG_INTAKE_URL}?dd-api-key=${DATADOG_CLIENT_TOKEN}&ddsource=browser&service=${SERVICE}`;

  // Fire-and-forget. keepalive ensures the request survives page navigations (e.g. the OAuth redirect).
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([entry]),
    keepalive: true,
  }).catch(() => {
    // never let logging errors surface to the caller
  });
}

export const logger = {
  info: (message: string, context?: LogContext) => send('info', message, context),
  warn: (message: string, context?: LogContext) => send('warn', message, context),
  error: (message: string, context?: LogContext) => send('error', message, context),
};
