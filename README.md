# Skrawl

A drawing mobile app game built with React Native and Expo.

## Features

- Drawing canvas with multiple tools
- Whiteboard mode
- Cross-platform consistency (iOS and Android)
- Dark and light theme support
- User interface for authentication flow (UI only)

## Tech Stack

- **Frontend**: React Native for iOS and Android
- **State Management**: Zustand
- **Canvas**: HTML5 Canvas with optimizations
- **Navigation**: React Navigation
- **UI Components**: Custom themed components

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/skrawl.git
cd skrawl
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Run on a device or emulator
```bash
# For iOS
npm run ios
# or
yarn ios

# For Android
npm run android
# or
yarn android
```

## Project Structure

```
skrawl/
├── src/
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable components
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Screen components
│   │   ├── auth/      # Authentication screens
│   │   └── main/      # Main app screens
│   ├── store/         # Zustand state management
│   ├── theme/         # Theme configuration
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── App.tsx            # Root component
└── index.ts           # Entry point
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
