/**
 * Activity feed list item
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, spacing } from '../theme';
import type { ActivityItem as ActivityItemType } from '../types';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  material: 'cube',
  task: 'checkbox',
  project: 'business',
  ai: 'sparkles',
};

interface Props {
  item: ActivityItemType;
}

export function ActivityFeedItem({ item }: Props) {
  const icon = TYPE_ICONS[item.type] ?? 'pulse';
  const timeAgo = formatTimeAgo(item.timestamp);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.burntOrange} />
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
    </View>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graphiteBorder,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.orangeGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  message: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  time: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: 4,
    fontFamily: Typography.fontFamily.regular,
  },
});
