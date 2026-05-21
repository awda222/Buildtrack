/**
 * Root app navigator — auth vs main app
 */
import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { MaterialFormScreen } from '../screens/MaterialFormScreen';
import { TaskFormScreen } from '../screens/TaskFormScreen';
import { ProjectFormScreen } from '../screens/ProjectFormScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { Colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.burntOrange,
    background: Colors.matteBlack,
    card: Colors.charcoalBlack,
    text: Colors.softWhite,
    border: Colors.graphiteBorder,
    notification: Colors.burntOrange,
  },
};

export function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.matteBlack },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="MaterialForm" component={MaterialFormScreen} />
          <Stack.Screen name="TaskForm" component={TaskFormScreen} />
          <Stack.Screen name="ProjectForm" component={ProjectFormScreen} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
