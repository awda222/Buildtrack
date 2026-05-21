/**
 * Styled text input with orange focus border
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, borderRadius, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secureToggle?: boolean;
}

export function Input({
  label,
  error,
  icon,
  secureToggle,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.focused,
          error && styles.errorBorder,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? Colors.burntOrange : Colors.lightGrey}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.lightGrey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={hidden}
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.lightGrey}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.charcoalBlack,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
    paddingHorizontal: spacing.md,
  },
  focused: {
    borderColor: Colors.burntOrange,
    shadowColor: Colors.burntOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  errorBorder: { borderColor: Colors.danger },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.md,
    paddingVertical: spacing.md,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.sizes.xs,
    marginTop: spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
});
