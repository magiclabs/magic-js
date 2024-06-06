import { datadogLogs } from '@datadog/browser-logs';

export const logInfo = (msg: string, data: any = {}) => {
  datadogLogs.logger.log(msg, { data });
};

export const logError = (msg: string, data: any = {}) => {
  datadogLogs.logger.error(msg, { data });
};
