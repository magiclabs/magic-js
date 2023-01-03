# ✨ Magic Authentication JavaScript SDK

 [![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

 > Magic empowers developers to protect their users via an innovative, passwordless authentication flow without the UX compromises that burden traditional OAuth implementations.
 <p align="center">
   <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/react-native-expo/LICENSE">License</a> ·
   <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/react-native-expo/CHANGELOG.md">Changelog</a> ·
   <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
 </p>

## ⚠️ Major Change: Package Split Beta ⚠️ 
Please note that splitting the `Expo` and `Bare React Native` Magic package is a part of a **beta** release. Take whatever precautions necessary to verify use before installing on your production application. As always, in the case something goes awry, you may open an issue and revert your package to the previous pre-split stable version `magic-sdk/react-native@x.x.x`.

 ## 📖 Documentation

 See the [developer documentation](https://magic.link/docs) to learn how you can master the Magic SDK in a matter of minutes.

 ## 🔗 Installation

 Integrating your app with Magic will require our client-side NPM package:

 ```bash
 # Via NPM:
 npm install --save @magic-sdk/react-native-expo
 # Via Yarn:
 yarn add @magic-sdk/react-native-expo
 ```

 ## ⚡️ Quick Start

 Sign up or log in to the [developer dashboard](https://dashboard.magic.link) to receive API keys that will allow your application to interact with Magic's authentication APIs.

 Then, you can start authenticating users with _just one method!_

 ```tsx
 import React from 'react';
 import { Magic } from '@magic-sdk/react-native-bare';
 const magic = new Magic('YOUR_API_KEY');
 export default function App() {
   return <>
     {/* Render the Magic iframe! */}
     <magic.Relayer />
     {...}
   </>
 }
 // Somewhere else in your code...
 await magic.auth.loginWithMagicLink({ email: 'your.email@example.com' });
 ```
 ## 🙌🏾 Troubleshooting

 ### Symlinking in Monorepo w/ Metro

For React Native projects living within a **monorepo** that run into the following `TypeError: Undefined is not an object` error: 

<img width="299" alt="Screenshot 2022-11-23 at 12 19 19 PM" src="https://user-images.githubusercontent.com/13407884/203641477-ec2e472e-86dc-4a22-b54a-eb694001617e.png">

When attempting to import `Magic`, take note that the React Native metro bundler doesn’t work well with symlinks, which tend to be utilized by most package managers. 

For this issue consider using Microsoft's [rnx-kit](https://microsoft.github.io/rnx-kit/docs/guides/bundling) suite of tools that include a plugin for metro that fixes this symlink related error. 
