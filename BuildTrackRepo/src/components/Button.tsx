/**
 * Premium button with orange glow hover effect
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, borderRadius, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.wrapper, style, isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={[Colors.burntOrange, Colors.amberOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryGradient}
        >
          {loading ? (
            <ActivityIndicator color={Colors.softWhite} />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: styles.secondary,
    outline: styles.outline,
    ghost: styles.ghost,
    danger: styles.danger,
  };

  const variantText = {
    secondary: styles.secondaryText,
    outline: styles.outlineText,
    ghost: styles.ghostText,
    danger: styles.dangerText,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        variantStyles[variant as keyof typeof variantStyles],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.burntOrange : Colors.softWhite}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              variantText[variant as keyof typeof variantText],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...{
      shadowColor: Colors.burntOrange,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  primaryText: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  baseText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
  },
  secondary: {
    backgroundColor: Colors.steelGrey,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  secondaryText: { color: Colors.softWhite },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.burntOrange,
  },
  outlineText: { color: Colors.burntOrange },
  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: Colors.lightGrey },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  dangerText: { color: Colors.danger },
  disabled: { opacity: 0.5 },
});
