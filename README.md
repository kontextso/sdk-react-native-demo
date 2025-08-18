This is a simple project that demonstrates how to use the Kontex [React Native SDK](https://docs.kontext.so/sdk/react-native).

## Getting Started

1. This demo uses [Expo](https://expo.dev/). First, make sure you have [set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated).

2. Clone the repository.

```bash
git clone git@github.com:kontextso/sdk-react-native-demo.git
cd sdk-react-native-demo
```

3. Install dependencies

```bash
npm install
```

4. Update your publisher token and placement code.

Open `constants.ts` and replace the placeholders with your actual publisher token and placement code:

```ts
export const PUBLISHER_TOKEN = "<your publisher token>";
export const PLACEMENT_CODE = "<your placement code>";
```

5. Run the development server (iOS or Android)

```bash
npm run ios
npm run android

```

6. Click `i` to  open the iOS simulator or `a` to open the Android emulator.


## Learn More

To learn more about the Kontext React Native SDK, check out the following resource:

- [Kontext React Native SDK Documentation](https://docs.kontext.so/sdk/react-native)
