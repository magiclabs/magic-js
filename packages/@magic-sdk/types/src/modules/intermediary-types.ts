import { LoginWithEmailOTPEventsHandler, LoginWithMagicLinkEventsHandler } from './auth-types';

export type IntermediaryEvents = keyof LoginWithEmailOTPEventsHandler | keyof LoginWithMagicLinkEventsHandler;
export type IntermediaryEventPayload = {
  payloadId: string;
  eventType: IntermediaryEvents;
  args: any;
};
