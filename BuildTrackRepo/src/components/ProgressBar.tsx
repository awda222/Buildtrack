/**
 * Animated progress bar with orange gradient fill
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, borderRadius, spacing } from '../theme';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercent?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercent = true,
  height = 8,
  color,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && (
            <Text style={styles.percent}>{Math.round(clamped)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <LinearGradient
          colors={
            color
              ? [color, color]
              : [Colors.burntOrange, Colors.amberOrange]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.fill,
            { width: `${clamped}%`, height, borderRadius: height / 2 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.sm,
  },
  percent: {
    color: Colors.burntOrange,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.sm,
  },
  track: {
    backgroundColor: Colors.charcoalBlack,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
