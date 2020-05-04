## Upcoming Changes

#### Fixed

- ...

#### Changed

- ...

#### Added

- Support for configuring [Harmony](https://www.harmony.one/) network as the Etherum chain type. Further documentation is coming soon.

## `1.2.1` - 04/30/2020

#### Fixed

- Removed the `pako` dependency as it was negatively impacting SDK bundle size.

## `1.2.0` - 04/29/2020

#### Added

- The new `Extension` interface will soon enable Magic SDK to support official
  and third-party plugins!

## `1.1.4` - 04/28/2020

#### Changed

- Allow JSON RPC responses from the Magic `<iframe>` to be explicitly `null`.

## `1.1.3` - 04/28/2020

#### Fixed

- A bug on Safari that would lead to persistent `TypeError`s when using the CDN build of the library.

## `1.1.2` - 04/22/2020

#### Fixed

- Certain NodeJS globals/polyfills were not available in React Native environments. These polyfills are now bootstrapped automatically.

## `1.1.1` - 04/22/2020

#### Added

- Support for React Native:

```tsx
// Import the React Native bundle
// (Don't worry, the API is exactly the same!)
import { Magic } from 'magic-sdk/react-native';

const magic = new Magic('API_KEY');

function App() {
  return (<div>
    {/* Just render the `Modal` component to connect Magic SDK! 🚀 */}
    <magic.Relayer />
  </div>);
}
```

## `1.0.3` - 04/21/2020

#### Added

- `UpdateEmailFailed` RPCErrorCode for when update email fails.

## `1.0.2` - 04/15/2020

#### Added

- `preload` method for downloading the assets required to render the Magic `<iframe>`.

## `1.0.1` - 04/09/2020

This is the first release our changelog records. Future updates will be logged in the following format:

#### Fixed

- Bug fixes and patches will be described here.

#### Changed

- Changes (breaking or otherwise) to current APIs will be described here.

#### Added

- New features or APIs will be described here.
