/**
 * BuildTrack — Smart Construction Management Powered by AI
 * Root application entry point
 */
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Sora_600SemiBold } from '@expo-google-fonts/sora';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initFirebase } from './src/services/firebase';
import { Colors } from './src/theme';

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore when splash API is unavailable on some platforms.
});

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [fontLoadTimedOut, setFontLoadTimedOut] = useState(false);

  const [fontsLoaded, fontLoadError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Sora_600SemiBold,
  });

  useEffect(() => {
    // Initialize Firebase if configured
    initFirebase();
    setAppReady(true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setFontLoadTimedOut(true), 2500);
    return () => clearTimeout(timeout);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady && (fontsLoaded || fontLoadTimedOut || fontLoadError)) {
      await SplashScreen.hideAsync();
    }
  }, [appReady, fontsLoaded, fontLoadTimedOut, fontLoadError]);

  if (!appReady) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: Colors.matteBlack }}
      onLayout={onLayoutRootView}
    >
      <AuthProvider>
        <AppProvider>
          <StatusBar style="light" backgroundColor={Colors.matteBlack} />
          <AppNavigator />
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
