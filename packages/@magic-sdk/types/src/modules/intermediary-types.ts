import { LoginWithEmailOTPEvents, LoginWithMagicLinkEvents } from './auth-types';

export type IntermediaryEvents = keyof LoginWithEmailOTPEvents | keyof LoginWithMagicLinkEvents | keyof GeneralEvents;
export type IntermediaryEventPayload = {
  payloadId: string;
  eventType: IntermediaryEvents;
  args: any;
};

export type GeneralEvents = {
  cancel: () => void;
};
