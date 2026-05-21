/**
 * Main bottom tab navigator
 */
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MaterialsScreen } from '../screens/MaterialsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Colors, Typography } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.burntOrange,
        tabBarInactiveTintColor: Colors.lightGrey,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Materials: focused ? 'cube' : 'cube-outline',
            Tasks: focused ? 'checkbox' : 'checkbox-outline',
            Projects: focused ? 'business' : 'business-outline',
            AIAssistant: focused ? 'sparkles' : 'sparkles-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return (
            <Ionicons
              name={icons[route.name] ?? 'ellipse'}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen name="Materials" component={MaterialsScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ tabBarLabel: 'AI' }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.charcoalBlack,
    borderTopColor: Colors.graphiteBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
  },
});
