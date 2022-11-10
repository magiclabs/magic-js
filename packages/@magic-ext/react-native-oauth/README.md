## ⚠️ Package Split 

Since `v9.0.0`, `@magic-sdk/react-native` package drops support of bare React Native (RN). You may stay on `^v8.0.0` to keep your bare RN app functional. With this in mind, bare React Native applications utlilizing OAuth should note that `@magic-ext/react-native-oauth` uses `expo-web-browser` as a dependency.

If this dependency causes you issues, consider enabling the expo library via `npx install-expo-modules@latest`. For more context, you may check: https://docs.expo.dev/bare/installing-expo-modules.

We plan to release a new package to support bare-RN exclusively soon.

 


