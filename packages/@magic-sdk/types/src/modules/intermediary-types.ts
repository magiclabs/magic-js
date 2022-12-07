import { LoginWithEmailOTPEvents, LoginWithMagicLinkEvents, LoginWithSMSEvents } from './auth-types';

export type IntermediaryEvents =
  | keyof LoginWithEmailOTPEvents
  | keyof LoginWithMagicLinkEvents
  | keyof LoginWithSMSEvents;
export type IntermediaryEventPayload = {
  payloadId: string;
  eventType: IntermediaryEvents;
  args: any;
};
