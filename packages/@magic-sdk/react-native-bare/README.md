# ✨ Magic Authentication JavaScript SDK 

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> Magic empowers developers to protect their users via an innovative, passwordless authentication flow without the UX compromises that burden traditional OAuth implementations.

<p align="center">
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/react-native-bare/LICENSE">License</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/react-native-bare/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
</p>

## ⚠️ Removal of `loginWithMagicLink()`  ⚠️
As of `v19.0.0`, passcodes (ie. `loginWithSMS()`, `loginWithEmailOTP()`) are replacing Magic Links (ie. `loginWithMagicLink()`) for all of our Mobile SDKs⁠. [Learn more](https://magic.link/docs/auth/login-methods/email/email-link-update-march-2023)

## 📖 Documentation

See the [developer documentation](https://magic.link/docs) to learn how you can master the Magic SDK in a matter of minutes.

## 🔗 Installation

Integrating your app with Magic will require our client-side NPM package: 

```bash
# Via NPM:
npm install --save @magic-sdk/react-native-bare
npm install --save react-native-device-info # Required Peer Dependency
npm install --save @react-native-community/async-storage # Required Peer Dependency
npm install --save react-native-safe-area-context # Required Peer Dependency
npm install --save @react-native-community/netinfo # Required Peer Dependency

# Via Yarn:
yarn add @magic-sdk/react-native-bare
yarn add react-native-device-info # Required Peer Dependency
yarn add @react-native-community/async-storage # Required Peer Dependency
yarn add react-native-safe-area-context # Required Peer Dependency
yarn add @react-native-community/netinfo # Required Peer Dependency
```

## ⚡️ Quick Start

Sign up or log in to the [developer dashboard](https://dashboard.magic.link ) to receive API keys that will allow your application to interact with Magic's authentication APIs. 

Then, you can start authenticating users with _just one method!_

```tsx
import React from 'react';
import { Magic } from '@magic-sdk/react-native-bare';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const magic = new Magic('YOUR_API_KEY');

export default function App() {
  return <>
	 <SafeAreaProvider>
	    {/* Render the Magic iframe! */}
	    <magic.Relayer />
	    {...}
	 </SafeAreaProvider>
  </>
}

// Somewhere else in your code...
await magic.auth.loginWithEmailOTP({ email: 'your.email@example.com' });
```
⁠⁠👉 Check out some of our [React Native Demo apps](https://github.com/magiclabs/react-native-demo) for inspiration! 👀

## 👀 SafeAreaView
Please note that as of **v14.0.0** our React Native package offerings wrap the `<magic.Relayer />` in [react-native-safe-area-context's](https://github.com/th3rdwave/react-native-safe-area-context) `<SafeAreaView />`. To prevent any adverse behavior in your app, please place the Magic iFrame React component at the root view of your application wrapped in a [SafeAreaProvider](https://github.com/th3rdwave/react-native-safe-area-context#safeareaprovider) as described in the documentation. 

We have also added an optional `backgroundColor` prop to the `Relayer` to fix issues with `SafeAreaView` showing the background. By default, the background will be white. If you have changed the background color as part of your [custom branding setup](https://magic.link/docs/authentication/features/login-ui#configuration), make sure to pass your custom background color to `magic.Relayer`:
```tsx
<magic.Relayer backgroundColor="#0000FF"/>
```

## 🙌🏾 Troubleshooting

### Symlinking in Monorepo w/ Metro

For React Native projects living within a **monorepo** that run into the following `TypeError: Undefined is not an object` error:

<img width="299" alt="Screenshot 2022-11-23 at 12 19 19 PM" src="https://user-images.githubusercontent.com/13407884/203641477-ec2e472e-86dc-4a22-b54a-eb694001617e.png">

When attempting to import `Magic`, take note that the React Native metro bundler doesn’t work well with symlinks, which tend to be utilized by most package managers.

For this issue consider using Microsoft's [rnx-kit](https://microsoft.github.io/rnx-kit/docs/guides/bundling) suite of tools that include a plugin for metro that fixes this symlink related error.

### Handling internet connection problems
When an app is opened without internet connection, any request to the Magic SDK will result in a rejection with a `MagicSDKError`:

```json
{
  "code": "MODAL_NOT_READY",
  "rawMessage": "Modal is not ready."
}
```


It is good practice to use [@react-native-community/netinfo](https://www.npmjs.com/package/@react-native-community/netinfo) to track the internet connection state of the device.  For your convenience, we've also added a hook that uses this library behind the scenes:


 ```tsx
import { useInternetConnection } from '@magic-sdk/react-native-expo';

const magic = new Magic('YOUR_API_KEY');

const connected = useInternetConnection()

useEffect(() => {
    if (!connected) {
        // Unomount this component and show your "You're offline" screen.
    }
}, [connected])

export default function App() {
    return <>
        <SafeAreaProvider>
            {/* Render the Magic iframe! */}
            <magic.Relayer />
            {...}
        </SafeAreaProvider>
    </>
}
```
