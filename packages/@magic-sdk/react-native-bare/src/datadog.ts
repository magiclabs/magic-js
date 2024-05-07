import { DdLogs } from '@datadog/mobile-react-native';

export const logInfo = (msg: string, data: any = {}) => {
  DdLogs.info(msg, { data });
};

export const logError = (msg: string, data: any = {}) => {
  DdLogs.error(msg, { data });
};
