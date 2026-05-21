/**
 * Dashboard stat card with icon and optional alert state
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors, Typography, spacing } from '../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  alert?: boolean;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  alert = false,
  subtitle,
}: StatCardProps) {
  return (
    <Card style={styles.card} glow={alert}>
      <View style={[styles.iconWrap, alert && styles.iconAlert]}>
        <Ionicons
          name={icon}
          size={22}
          color={alert ? Colors.danger : Colors.burntOrange}
        />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    margin: spacing.xs,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.orangeGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  value: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.xl,
  },
  title: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  subtitle: {
    color: Colors.burntOrange,
    fontSize: Typography.sizes.xs,
    marginTop: 4,
    fontFamily: Typography.fontFamily.medium,
  },
});
