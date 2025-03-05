import { Logger, StatusType, datadogLogs } from '@datadog/browser-logs';
import { version } from '../../../../magic-sdk/package.json';

const logType = ['log', 'debug', 'info', 'warn', 'error'] as const;
type LogType = (typeof logType)[number];

datadogLogs.init({
  clientToken: 'pube2f71cb15fa207650d3c38c76cee479e',
  site: 'datadoghq.com',
  service: 'mandrake',
  version: version,
  forwardErrorsToLogs: true,
  usePartitionedCrossSiteSessionCookie: true,
  sessionSampleRate: 100,
  useSecureSessionCookie: true,
});

export const logger = getClientLogger();

/* Use a Proxy to maintain the ability to use the
shorthand methods (like .log, .debug, .info, .warn, .error),
while allowing for getBaseAnalyticsProperties to be computed */
let proxiedLogger: Logger;

export function getClientLogger(): Logger {
  if (!proxiedLogger) {
    const baseLogger = datadogLogs.logger;

    proxiedLogger = new Proxy(baseLogger, {
      get(target, prop) {
        if (logType.includes(prop as LogType)) {
          return (message: string, messageContext?: Record<string, unknown>, status?: StatusType, error?: Error) => {
            const baseProperties = {};
            const combinedProperties = { ...baseProperties, ...messageContext };

            if (prop === 'log') {
              target.log(message, combinedProperties, status, error);
            } else {
              //@ts-expect-error Requires ugly "type as" to pass typing
              target[prop as keyof Logger](message, combinedProperties);
            }
            console.log('Magic SDK Log:', message);
          };
        }

        return target[prop as keyof Logger];
      },
    });
  }

  return proxiedLogger;
}
