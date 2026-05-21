/**
 * Login screen — Firebase auth + demo credentials
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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components';
import { Colors, Typography, spacing } from '../../theme';
import { DEMO_CREDENTIALS } from '../../constants/demoData';
import type { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
const LOGO = require('../../../assets/images/buildtrack-logo.png');

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      setError(msg);
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[Colors.matteBlack, Colors.charcoalBlack, Colors.matteBlack]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.brand}>BuildTrack</Text>
            <Text style={styles.tagline}>
              Smart Construction Management Powered by AI
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>
              Sign in to manage your construction sites
            </Text>

            <Input
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="admin@buildtrack.demo"
            />
            <Input
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureToggle
              secureTextEntry
              placeholder="••••••••"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Sign In" onPress={handleLogin} loading={loading} />

            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <Text style={styles.demoText}>
                Admin: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
              </Text>
              <Text style={styles.demoText}>
                Supervisor: {DEMO_CREDENTIALS.supervisorEmail} /{' '}
                {DEMO_CREDENTIALS.supervisorPassword}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>
              Don't have an account?{' '}
              <Text style={styles.signupAccent}>Sign Up</Text>
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
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  logoSection: { alignItems: 'center', marginBottom: spacing.xl },
  logoImage: { width: 260, height: 110, marginBottom: spacing.md },
  brand: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.hero,
  },
  tagline: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  form: {
    backgroundColor: Colors.steelGrey,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  heading: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.xl,
    marginBottom: spacing.xs,
  },
  subheading: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.sm,
    marginBottom: spacing.lg,
  },
  error: {
    color: Colors.danger,
    marginBottom: spacing.md,
    fontFamily: Typography.fontFamily.regular,
  },
  demoBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: Colors.charcoalBlack,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  demoTitle: {
    color: Colors.burntOrange,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  demoText: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 18,
  },
  signupLink: { alignItems: 'center', marginTop: spacing.lg },
  signupText: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.md,
  },
  signupAccent: {
    color: Colors.burntOrange,
    fontFamily: Typography.fontFamily.semiBold,
  },
});
