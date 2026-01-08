export interface ClientTheme {
  appName: string;
  assetUri: string;
  textColor: `#${string}`;
  buttonColor: `#${string}` | undefined;
  buttonRadius: string | undefined;
  containerRadius: string | undefined;
  backgroundColor: `#${string}` | undefined;
  themeColor: 'auto' | 'dark' | 'light';
}

export interface ClientConfig {
  clientId: string;
  theme: ClientTheme;
  authProviders: {
    primary: string[];
    secondary: string[];
    social: string[];
  };
}

