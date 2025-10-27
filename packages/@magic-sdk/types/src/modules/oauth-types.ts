export enum OAuthPopupEventOnReceived {
  PopupUrl = 'popup-url',
}

export enum OAuthPopupEventEmit {
  PopupEvent = 'popup-event',
}

export type OAuthPopupEventHandlers = {
  // Event sent
  [OAuthPopupEventEmit.PopupEvent]: (eventData: unknown) => void;
  // Event Received
  [OAuthPopupEventOnReceived.PopupUrl]: (event: { popupUrl: string; provider: string }) => void;
};
