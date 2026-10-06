import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Returns the backend API base URL.
 * Automatically resolves the host IP when running in Expo Go or physical devices,
 * ensuring both online and offline checks work reliably without network timeouts.
 */
export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Extract host IP from Expo bundler (works on real devices, Expo Go, and simulators)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://192.168.1.17:3000';
  }
  return 'http://localhost:3000';
}

