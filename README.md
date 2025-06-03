# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# Snake Game (React Native + Expo)

A modular, feature-based, and atomic-design Snake game built with React Native and Expo.

## Features

- Touch controls (mobile) and keyboard controls (web)
- Randomized snake, fruits (🥒), bombs (💣), hearts (❤️), and time boosters (⏱️)
- Player name entry and start countdown
- Modular, scalable codebase using feature-based and atomic design

## Project Structure

```
/app
  /features
    /snake
      /components
        /atoms
        /molecules
        /organisms
      SnakeGame.tsx
      snakeUtils.ts
      snakeTypes.ts
      snakeStyles.ts
  /constants
    gameConstants.ts
  App.tsx
```

## Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Start the app

```sh
npx expo start
```

- Scan the QR code with Expo Go (iOS/Android) or run in a simulator/emulator.
- For web: press `w` in the Expo CLI and open in your browser.

## Build for Production

- [Expo build docs](https://docs.expo.dev/build/introduction/)
- For app stores, use [EAS Build](https://docs.expo.dev/eas-build/introduction/).

## Code Style

- **Feature-based**: All logic, types, and styles for the snake game are in `/features/snake`.
- **Atomic design**: UI is split into atoms (Cell), molecules (Board), and organisms (PauseModal, NameInput).
- **Constants** are shared via `/constants`.

## License

MIT
