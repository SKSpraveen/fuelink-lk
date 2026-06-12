import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

function RootLayoutNav() {
  const { userToken, userRole, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = segments.length === 0 || segments[0] === 'register' || segments[0] === 'index';

    if (userToken && isPublicRoute) {
      if (userRole === 'SHED_OWNER') {
        router.replace('/(owner-tabs)/dashboard');
      } else {
        router.replace('/(tabs)/home');
      }
    } else if (!userToken && !isPublicRoute) {
      router.replace('/');
    }
  }, [userToken, userRole, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
