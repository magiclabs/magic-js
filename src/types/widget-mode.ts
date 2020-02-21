export enum WidgetModePrimaryLoginOption {
  LoginWithEmail = 'email',
  LoginWithPhone = 'phone',
}

export interface WidgetModeConfiguration {
  primaryLoginOption?: WidgetModePrimaryLoginOption;
}
