# SyncMeet Project Structure

## Root Directory
```
SyncMeet/
├── 📁 .expo/                          # Expo configuration files
├── 📁 .git/                           # Git repository data
├── 📁 .idea/                          # IntelliJ IDEA configuration
├── 📁 .vscode/                        # VS Code configuration
├── 📁 android/                        # Android native code
│   ├── 📁 .gradle/                    # Gradle cache
│   ├── 📁 app/                        # Android app module
│   ├── 📁 gradle/                     # Gradle wrapper
│   ├── 📄 build.gradle                # Android build configuration
│   ├── 📄 gradle.properties           # Gradle properties
│   ├── 📄 gradlew                     # Gradle wrapper script (Unix)
│   ├── 📄 gradlew.bat                 # Gradle wrapper script (Windows)
│   └── 📄 settings.gradle             # Gradle settings
├── 📁 app/                            # Main app screens (Expo Router)
│   ├── 📁 (tabs)/                     # Tab navigation screens
│   │   ├── 📄 _layout.tsx             # Tab layout configuration
│   │   ├── 📄 calendar.tsx            # Calendar screen
│   │   ├── 📄 index.tsx               # Home screen
│   │   ├── 📄 meeting.tsx             # Meetings screen
│   │   ├── 📄 schedule.tsx            # Schedule screen
│   │   └── 📄 settings.tsx            # Settings screen
│   ├── 📄 _layout.tsx                 # Root layout configuration
│   ├── 📄 api.js                      # API configuration (deprecated)
│   ├── 📄 change-password.tsx         # Change password screen
│   ├── 📄 edit-meeting.tsx            # Edit meeting screen
│   ├── 📄 edit-profile.tsx            # Edit profile screen
│   ├── 📄 forgot-password.tsx         # Forgot password screen
│   ├── 📄 index.tsx                   # Root index
│   ├── 📄 login.tsx                   # Login screen
│   ├── 📄 meeting-room.tsx            # Meeting room screen
│   ├── 📄 personal-information.tsx    # Personal information screen
│   ├── 📄 privacy-settings.tsx        # Privacy settings screen
│   ├── 📄 reminder-settings.tsx       # Reminder settings screen
│   ├── 📄 signup.tsx                  # Signup screen
│   ├── 📄 splash.tsx                  # Splash screen
│   ├── 📄 styles.ts                   # Global styles
│   └── 📄 video-call.tsx              # Video call screen
├── 📁 assets/                         # Static assets
│   ├── 📁 fonts/                      # Font files
│   │   └── 📄 SpaceMono-Regular.ttf   # Space Mono font
│   └── 📁 images/                     # Image assets
│       ├── 📄 Logo.png                # App logo
│       ├── 📄 adaptive-icon.png       # Adaptive icon
│       ├── 📄 alon.jpeg               # Profile image
│       ├── 📄 favicon.png             # Favicon
│       ├── 📄 icon.png                # App icon
│       ├── 📄 mark.jpg                # Profile image
│       ├── 📄 profile.jpg             # Profile image
│       ├── 📄 splash.png              # Splash screen image
│       └── 📄 susan.jpg               # Profile image
├── 📁 components/                     # Reusable components
│   ├── 📁 __tests__/                  # Component tests
│   │   └── 📄 StyledText-test.js      # StyledText component test
│   ├── 📄 auth-context.tsx            # Authentication context
│   ├── 📄 authService.js              # Authentication service
│   ├── 📄 ChatContext.tsx             # Chat context
│   ├── 📄 ContactContext.tsx          # Contact context
│   ├── 📄 ContactsMenu.tsx            # Contacts menu component
│   ├── 📄 CustomButton.tsx            # Custom button component
│   ├── 📄 EditScreenInfo.tsx          # Edit screen info component
│   ├── 📄 MeetingContext.tsx          # Meeting context
│   ├── 📄 MenuButton.tsx              # Menu button component
│   ├── 📄 ParticipantContext.tsx      # Participant context
│   ├── 📄 PhotoUpload.tsx             # Photo upload component
│   ├── 📄 ScheduleContext.tsx         # Schedule context
│   ├── 📄 SearchBar.tsx               # Search bar component
│   ├── 📄 StyledText.tsx              # Styled text component
│   ├── 📄 ThemeAwareBottomSheet.tsx   # Theme-aware bottom sheet
│   ├── 📄 ThemeAwareModal.tsx         # Theme-aware modal
│   ├── 📄 ThemeContext.tsx            # Theme context
│   └── 📄 Themed.tsx                  # Themed component wrapper
├── 📁 constants/                      # App constants
│   ├── 📄 Colors.ts                   # Color definitions
│   ├── 📄 index.ts                    # Constants index
│   ├── 📄 index.tsx                   # Constants index (JSX)
│   └── 📄 Layout.ts                   # Layout constants
├── 📁 hooks/                          # Custom React hooks
│   ├── 📄 useCachedResources.ts       # Cached resources hook
│   ├── 📄 useColorScheme.ts           # Color scheme hook
│   └── 📄 usePermissions.ts           # Permissions hook
├── 📁 node_modules/                   # Node.js dependencies
├── 📁 scripts/                        # Build and utility scripts
│   └── 📄 reset-project.js            # Project reset script
├── 📁 src/                            # Source code (Android)
│   └── 📁 main/                       # Main source directory
│       ├── 📁 java/                   # Java source files
│       └── 📁 resources/              # Android resources
├── 📁 utils/                          # Utility functions
│   ├── 📄 api.ts                      # API client and endpoints
│   ├── 📄 fileUploadService.js        # File upload service
│   ├── 📄 notifications.ts            # Notification utilities
│   ├── 📄 storage.ts                  # Storage utilities
│   └── 📄 websocket.ts                # WebSocket utilities
├── 📄 .gitignore                      # Git ignore rules
├── 📄 app.config.js                   # Expo app configuration
├── 📄 app.json                        # Expo app manifest
├── 📄 eas.json                        # EAS Build configuration
├── 📄 eslint.config.js                # ESLint configuration
├── 📄 expo-env.d.ts                   # Expo TypeScript definitions
├── 📄 NOTIFICATION_README.md          # Notification setup guide
├── 📄 package-lock.json               # NPM lock file
├── 📄 package.json                    # NPM package configuration
├── 📄 README.md                       # Project readme
├── 📄 tsconfig.json                   # TypeScript configuration
└── 📄 types.tsx                       # TypeScript type definitions
```

## Key Directories Explained

### 📁 **app/** - Main Application Screens
- Uses Expo Router for file-based routing
- `(tabs)/` contains tab navigation screens
- Each `.tsx` file represents a screen/route

### 📁 **components/** - Reusable UI Components
- Context providers for state management
- UI components like buttons, modals, etc.
- Theme-aware components for dark/light mode

### 📁 **utils/** - Utility Functions
- `api.ts` - Centralized API client and endpoints
- `storage.ts` - AsyncStorage utilities
- `notifications.ts` - Push notification handling
- `websocket.ts` - Real-time communication

### 📁 **assets/** - Static Resources
- Images, fonts, and other static files
- Used throughout the app for branding and UI

### 📁 **constants/** - App Constants
- Colors, layouts, and other configuration
- Centralized place for app-wide constants

### 📁 **hooks/** - Custom React Hooks
- Reusable logic for components
- Permissions, caching, and theme management

## Technology Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router (file-based)
- **State Management**: React Context API
- **API**: Custom API client with fetch
- **Storage**: AsyncStorage
- **Real-time**: WebSocket
- **Video Calls**: Agora SDK
- **Styling**: React Native StyleSheet
- **TypeScript**: Full TypeScript support

## File Naming Conventions

- **Screens**: `kebab-case.tsx` (e.g., `video-call.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `CustomButton.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `api.ts`)
- **Constants**: `PascalCase.ts` (e.g., `Colors.ts`) 