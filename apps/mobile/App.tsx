import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomTabsNavigator } from './src/navigation/BottomTabs';
import { DietScreen } from './src/screens/DietScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { theme } = useTheme();
  const navigationTheme = {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      background: theme.background,
      card: theme.card,
      text: theme.textPrimary,
      border: theme.border,
      primary: theme.primary
    }
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.textPrimary,
          contentStyle: { backgroundColor: theme.background }
        }}
      >
        <Stack.Screen name="Main" component={BottomTabsNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Diet" component={DietScreen} options={{ title: 'Dieta' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
