/**
 * Settings — profile, notifications, theme, logout
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Header, Card, Button } from '../components';
import { Colors, Typography, spacing } from '../theme';
import { isFirebaseConfigured, isOpenAIConfigured, ENV } from '../config/env';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({ icon, label, value, onPress, rightElement }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={Colors.burntOrange} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value && <Text style={styles.rowValue}>{value}</Text>}
      </View>
      {rightElement ?? (
        onPress && (
          <Ionicons name="chevron-forward" size={20} color={Colors.lightGrey} />
        )
      )}
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const { user, signOut, isBuilder } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [aiWarnings, setAiWarnings] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Settings" subtitle="Manage your account" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile card */}
        <Card glow style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {isBuilder ? 'Builder / Admin' : 'Supervisor'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card>
          <SettingRow
            icon="person-outline"
            label="Display Name"
            value={user?.displayName}
          />
          <SettingRow icon="mail-outline" label="Email" value={user?.email} />
          <SettingRow
            icon="business-outline"
            label="Company"
            value={user?.company ?? 'Not set'}
          />
          <SettingRow
            icon="call-outline"
            label="Phone"
            value={user?.phone ?? 'Not set'}
          />
        </Card>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card>
          <SettingRow
            icon="notifications-outline"
            label="Push Notifications"
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: Colors.graphiteBorder, true: Colors.burntOrange }}
                thumbColor={Colors.softWhite}
              />
            }
          />
          <SettingRow
            icon="cube-outline"
            label="Low Stock Alerts"
            rightElement={
              <Switch
                value={lowStockAlerts}
                onValueChange={setLowStockAlerts}
                trackColor={{ false: Colors.graphiteBorder, true: Colors.burntOrange }}
                thumbColor={Colors.softWhite}
              />
            }
          />
          <SettingRow
            icon="time-outline"
            label="Deadline Reminders"
            rightElement={
              <Switch
                value={deadlineReminders}
                onValueChange={setDeadlineReminders}
                trackColor={{ false: Colors.graphiteBorder, true: Colors.burntOrange }}
                thumbColor={Colors.softWhite}
              />
            }
          />
          <SettingRow
            icon="sparkles-outline"
            label="AI Warnings"
            rightElement={
              <Switch
                value={aiWarnings}
                onValueChange={setAiWarnings}
                trackColor={{ false: Colors.graphiteBorder, true: Colors.burntOrange }}
                thumbColor={Colors.softWhite}
              />
            }
          />
        </Card>

        {/* Theme */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card>
          <SettingRow
            icon="moon-outline"
            label="Theme"
            value="Dark Industrial (Default)"
          />
          <SettingRow
            icon="color-palette-outline"
            label="Accent Color"
            value="Burnt Orange #FF6B00"
          />
        </Card>

        {/* Integrations status */}
        <Text style={styles.sectionTitle}>Integrations</Text>
        <Card>
          <SettingRow
            icon="logo-firebase"
            label="Firebase"
            value={isFirebaseConfigured() ? 'Connected' : 'Demo Mode'}
          />
          <SettingRow
            icon="sparkles"
            label="OpenAI"
            value={isOpenAIConfigured() ? 'Connected' : 'Demo Mode'}
          />
          <SettingRow
            icon="information-circle-outline"
            label="App Mode"
            value={ENV.demoMode ? 'Demo Data' : 'Production'}
          />
        </Card>

        <Text style={styles.version}>BuildTrack v1.0.0</Text>
        <Text style={styles.tagline}>
          Smart Construction Management Powered by AI
        </Text>

        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.burntOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: Colors.softWhite,
    fontSize: 28,
    fontFamily: Typography.fontFamily.bold,
  },
  profileInfo: { flex: 1 },
  profileName: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.lg,
  },
  profileEmail: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.orangeGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.burntOrange,
  },
  roleText: {
    color: Colors.burntOrange,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.semiBold,
  },
  sectionTitle: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graphiteBorder,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.orangeGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowContent: { flex: 1 },
  rowLabel: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.md,
  },
  rowValue: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  version: {
    color: Colors.lightGrey,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.sm,
  },
  tagline: {
    color: Colors.burntOrange,
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    marginTop: spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  logoutBtn: { marginTop: spacing.lg },
});
