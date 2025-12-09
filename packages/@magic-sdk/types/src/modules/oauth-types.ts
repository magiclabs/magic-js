export enum OAuthPopupEventOnReceived {
  PopupUrl = 'popup-url',
}

export enum OAuthPopupEventEmit {
  PopupEvent = 'popup-event',
  Cancel = 'cancel',
}

export type OAuthPopupEventHandlers = {
  // Event sent
  [OAuthPopupEventEmit.PopupEvent]: (eventData: unknown) => void;
  [OAuthPopupEventEmit.Cancel]: () => void;
  // Event Received
  [OAuthPopupEventOnReceived.PopupUrl]: (event: { popupUrl: string; provider: string }) => void;
};
