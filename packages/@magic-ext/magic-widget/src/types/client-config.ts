export interface ClientTheme {
  appName: string;
  assetUri: string;
  textColor: `#${string}`;
  buttonColor: `#${string}` | undefined;
  buttonRadius: string | undefined;
  containerRadius: string | undefined;
  backgroundColor: `#${string}` | undefined;
  neutralColor: `#${string}` | undefined;
  themeColor: 'auto' | 'dark' | 'light';
  customBrandingType: 1 | 2;
  isDefaultAsset?: boolean;
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

