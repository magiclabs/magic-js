import { Linking } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

export const openInBrowser = async (url: string) => {
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  } else {
    console.warn(`Cannot open URL: ${url}`);
  }
};

export const openInApp = async (url: string) => {
  const isInAppBrowserAvailable = await InAppBrowser.isAvailable();

  if (!isInAppBrowserAvailable) {
    await openInBrowser(url);
    return;
  }

  try {
    await InAppBrowser.open(url, {
      // iOS
      dismissButtonStyle: 'done',
      modalPresentationStyle: 'pageSheet',

      // Android
      showTitle: true,
      enableUrlBarHiding: true,
    });
  } catch (e) {
    await openInBrowser(url);
  }
};
