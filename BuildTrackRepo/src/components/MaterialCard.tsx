/**
 * Material inventory card with low-stock indicator
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors, Typography, spacing } from '../theme';
import type { Material } from '../types';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cement: 'cube',
  steel: 'git-branch',
  bricks: 'grid',
  sand: 'water',
  paint: 'color-palette',
  electrical: 'flash',
};

interface MaterialCardProps {
  material: Material;
  onPress?: () => void;
}

export function MaterialCard({ material, onPress }: MaterialCardProps) {
  const isLowStock = material.quantity < material.minThreshold;
  const icon = CATEGORY_ICONS[material.category] ?? 'construct';

  return (
    <Card onPress={onPress} glow={isLowStock} style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, isLowStock && styles.iconLow]}>
          <Ionicons
            name={icon}
            size={24}
            color={isLowStock ? Colors.danger : Colors.burntOrange}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {material.name}
          </Text>
          <Text style={styles.category}>{material.category.toUpperCase()}</Text>
        </View>
        {isLowStock && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>LOW</Text>
          </View>
        )}
      </View>
      <View style={styles.qtyRow}>
        <Text style={styles.qty}>
          {material.quantity}{' '}
          <Text style={styles.unit}>{material.unit}</Text>
        </Text>
        <Text style={styles.threshold}>
          Min: {material.minThreshold} {material.unit}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.orangeGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconLow: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  info: { flex: 1 },
  name: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
  },
  category: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
    fontFamily: Typography.fontFamily.regular,
  },
  alertBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertText: {
    color: Colors.softWhite,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.graphiteBorder,
  },
  qty: {
    color: Colors.burntOrange,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.lg,
  },
  unit: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  threshold: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    alignSelf: 'flex-end',
  },
});
