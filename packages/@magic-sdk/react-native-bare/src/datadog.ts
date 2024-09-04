// import { DdLogs } from '@datadog/mobile-react-native';

export const logInfo = (msg: string, data: any = {}) => {
   console.log(msg, { data });
};

export const logError = (msg: string, data: any = {}) => {
  console.log(msg, { data });
};
