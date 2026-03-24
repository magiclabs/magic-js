import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export const openInBrowser = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.warn(`Cannot open URL: ${url}`);
  }
};

export const openInApp = async (url: string) => {
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, // iOS
    });
  } catch (e) {
    await openInBrowser(url);
  }
};
