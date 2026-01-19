import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useTheme } from '../theme/ThemeProvider';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SpeedScreen } from '../screens/SpeedScreen';
import { StatusScreen } from '../screens/StatusScreen';
import { WorkoutScreen } from '../screens/WorkoutScreen';

export type BottomTabParamList = {
  Dashboard: undefined;
  Workout: undefined;
  Speed: undefined;
  Status: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const iconMap: Record<keyof BottomTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Dashboard: 'view-dashboard',
  Workout: 'dumbbell',
  Speed: 'speedometer',
  Status: 'chart-line',
  Profile: 'account'
};

export function BottomTabsNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = iconMap[route.name as keyof BottomTabParamList];
          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Workout" component={WorkoutScreen} options={{ title: 'Treinos' }} />
      <Tab.Screen name="Speed" component={SpeedScreen} options={{ title: 'Speed' }} />
      <Tab.Screen name="Status" component={StatusScreen} options={{ title: 'Status' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
