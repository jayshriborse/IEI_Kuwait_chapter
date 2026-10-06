import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular,
  Fraunces_700Bold,
  Fraunces_800ExtraBold,
  Fraunces_900Black,
} from '@expo-google-fonts/fraunces';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
    Fraunces_800ExtraBold,
    Fraunces_900Black,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: '#402310' } }} />
        <Stack.Screen name="guest" options={{ contentStyle: { backgroundColor: '#402310' } }} />
        <Stack.Screen name="apply-membership" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="find-record" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="dashboard" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="rsvp" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="card" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="renew" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="notifications" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="gallery" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="album-detail" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="jobs" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="job-detail" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="job-apply-success" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="community" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="blood-donors" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="mentors" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="mentor" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="profile" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="events" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="events-activities" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="technical-seminars" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="ec-tools" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="with-treasurer" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
        <Stack.Screen name="door-checkin" options={{ contentStyle: { backgroundColor: '#402310' } }} />
        <Stack.Screen name="review-application" options={{ contentStyle: { backgroundColor: '#F5EAD8' } }} />
      </Stack>
    </>
  );
}
