/**
 * Signup screen with role selection (Builder/Admin vs Supervisor)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Header } from '../../components';
import { Colors, Typography, spacing } from '../../theme';
import type { UserRole } from '../../types';
import type { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;
const LOGO = require('../../../assets/images/buildtrack-logo.png');

export function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<UserRole>('builder');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp({ email: email.trim(), password, displayName, role, company });
    } catch (e: unknown) {
      Alert.alert(
        'Signup Failed',
        e instanceof Error ? e.message : 'Could not create account'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <Header title="Create Account" onBack={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoWrap}>
            <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Input
            label="Full Name *"
            icon="person-outline"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="John Smith"
          />
          <Input
            label="Email *"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password *"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secureToggle
            secureTextEntry
          />
          <Input
            label="Company"
            icon="business-outline"
            value={company}
            onChangeText={setCompany}
            placeholder="Your construction company"
          />

          {/* Role selection */}
          <Text style={styles.roleLabel}>Select Role *</Text>
          <View style={styles.roleRow}>
            {(
              [
                { value: 'builder' as const, label: 'Builder / Admin', icon: 'hammer' },
                { value: 'supervisor' as const, label: 'Supervisor', icon: 'eye' },
              ] as const
            ).map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleCard, role === r.value && styles.roleActive]}
                onPress={() => setRole(r.value)}
              >
                <Ionicons
                  name={r.icon as keyof typeof Ionicons.glyphMap}
                  size={28}
                  color={
                    role === r.value ? Colors.burntOrange : Colors.lightGrey
                  }
                />
                <Text
                  style={[
                    styles.roleText,
                    role === r.value && styles.roleTextActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            style={styles.btn}
          />

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>
              Already have an account?{' '}
              <Text style={styles.loginAccent}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  logoWrap: { alignItems: 'center', marginBottom: spacing.md },
  logoImage: { width: 220, height: 90 },
  roleLabel: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  roleRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.steelGrey,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  roleActive: {
    borderColor: Colors.burntOrange,
    backgroundColor: Colors.orangeGlow,
  },
  roleText: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  roleTextActive: { color: Colors.burntOrange },
  btn: { marginTop: spacing.md },
  loginLink: {
    color: Colors.lightGrey,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  loginAccent: {
    color: Colors.burntOrange,
    fontFamily: Typography.fontFamily.semiBold,
  },
});
