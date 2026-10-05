import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient, setupQueryEnvironment } from './src/api/queryClient';
import { authService, installUnauthorizedHandler } from './src/auth/authService';
import { OfflineBanner, ToastHost } from './src/components/ui/Feedback';
import { RootNavigator } from './src/navigation/RootNavigator';
import { usePreferences } from './src/store/preferences';
import { useSession } from './src/store/session';
import { colors } from './src/theme';

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, PlayfairDisplay_700Bold });
  const prefsReady = usePreferences((s) => s.hydrated);
  const status = useSession((s) => s.status);

  useEffect(() => {
    // A failing storage/locale read must never keep the splash screen up forever.
    usePreferences.getState().hydrate().catch(() => usePreferences.setState({ hydrated: true }));
    useSession
      .getState()
      .hydrate()
      .then(() => authService.refreshProfile())
      .catch(() => useSession.setState({ status: 'guest' }));
    const offUnauthorized = installUnauthorizedHandler();
    const offQuery = setupQueryEnvironment();
    return () => {
      offUnauthorized();
      offQuery();
    };
  }, []);

  const ready = (fontsLoaded || !!fontError) && prefsReady && status !== 'restoring';
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={styles.root}>
          <StatusBar style="dark" />
          <RootNavigator />
          <OfflineBanner />
          <ToastHost />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.cream } });
