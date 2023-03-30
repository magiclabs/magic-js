import { LoginWithEmailOTPEvents, LoginWithMagicLinkEvents } from './auth-types';

export type IntermediaryEvents = keyof LoginWithEmailOTPEvents | keyof LoginWithMagicLinkEvents;
export type IntermediaryEventPayload = {
  payloadId: string;
  eventType: IntermediaryEvents;
  args: any;
};
