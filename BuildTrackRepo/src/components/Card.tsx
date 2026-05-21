/**
 * Glassmorphism card with optional orange glow border
 */
import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, borderRadius, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
  onPress?: () => void;
  padding?: number;
}

export function Card({
  children,
  style,
  glow = false,
  onPress,
  padding = spacing.md,
}: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        glow && styles.glowBorder,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

/** Glass card with blur effect (iOS/web) */
export function GlassCard({
  children,
  style,
  glow = false,
}: Omit<CardProps, 'onPress'>) {
  return (
    <View style={[styles.glassWrapper, glow && styles.glowBorder, style]}>
      <BlurView intensity={40} tint="dark" style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.steelGrey,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  glowBorder: {
    borderColor: Colors.burntOrange,
    shadowColor: Colors.burntOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  glassWrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  blur: {
    padding: spacing.md,
    backgroundColor: Colors.glass,
  },
});
