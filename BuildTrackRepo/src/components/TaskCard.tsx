/**
 * Task card with status badge and progress
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { Colors, Typography, spacing } from '../theme';
import type { Task, TaskStatus } from '../types';

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pending', color: Colors.lightGrey, bg: Colors.steelGrey },
  in_progress: {
    label: 'In Progress',
    color: Colors.burntOrange,
    bg: Colors.orangeGlow,
  },
  completed: {
    label: 'Completed',
    color: Colors.success,
    bg: 'rgba(34, 197, 94, 0.15)',
  },
};

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  delayed?: boolean;
}

export function TaskCard({ task, onPress, delayed }: TaskCardProps) {
  const status = STATUS_CONFIG[task.status];

  return (
    <Card onPress={onPress} glow={delayed} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>
      {task.projectName && (
        <Text style={styles.project}>{task.projectName}</Text>
      )}
      <View style={styles.meta}>
        <Text style={styles.assignee}>
          {task.assignedToName ?? 'Unassigned'}
        </Text>
        <Text style={[styles.deadline, delayed && styles.deadlineLate]}>
          {delayed ? 'OVERDUE' : `Due ${task.deadline}`}
        </Text>
      </View>
      <ProgressBar progress={task.progress} showPercent={false} height={4} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.semiBold,
  },
  project: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: 4,
    fontFamily: Typography.fontFamily.regular,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  assignee: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  deadline: {
    color: Colors.burntOrange,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  deadlineLate: { color: Colors.danger },
});
