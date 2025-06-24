import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { MeetingProvider } from '../components/MeetingContext';
import { ScheduleProvider } from '../components/ScheduleContext';
import { ThemeProvider } from '../components/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <MeetingProvider>
        <ScheduleProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ScheduleProvider>
      </MeetingProvider>
    </ThemeProvider>
  );
}



