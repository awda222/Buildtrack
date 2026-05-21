/**
 * Task management screen with status filters
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Header, TaskCard, EmptyState } from '../components';
import { Colors, Typography, spacing } from '../theme';
import { TASK_STATUSES } from '../utils/helpers';
import type { RootStackParamList } from '../navigation/types';
import type { TaskStatus } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function TasksScreen() {
  const navigation = useNavigation<Nav>();
  const { tasks, delayedTasks } = useApp();
  const [filter, setFilter] = useState<TaskStatus | 'all' | 'delayed'>('all');

  const filtered = useMemo(() => {
    if (filter === 'delayed') return delayedTasks;
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter, delayedTasks]);

  const filters = [
    { value: 'all' as const, label: 'All' },
    ...TASK_STATUSES,
    { value: 'delayed' as const, label: 'Delayed' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Tasks"
        subtitle={`${tasks.length} total · ${delayedTasks.length} delayed`}
        rightAction={{
          icon: 'add-circle',
          onPress: () => navigation.navigate('TaskForm', {}),
        }}
      />

      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, filter === item.value && styles.chipActive]}
            onPress={() => setFilter(item.value)}
          >
            <Text
              style={[
                styles.chipText,
                filter === item.value && styles.chipTextActive,
              ]}
            >
              {item.label}
              {item.value === 'delayed' && delayedTasks.length > 0
                ? ` (${delayedTasks.length})`
                : ''}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isDelayed =
            item.status !== 'completed' &&
            new Date(item.deadline) < new Date();
          return (
            <TaskCard
              task={item}
              delayed={isDelayed}
              onPress={() =>
                navigation.navigate('TaskForm', { task: item })
              }
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-outline"
            title="No Tasks"
            message="Create tasks to track site work"
            actionLabel="Create Task"
            onAction={() => navigation.navigate('TaskForm', {})}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  filters: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.steelGrey,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  chipActive: {
    backgroundColor: Colors.orangeGlow,
    borderColor: Colors.burntOrange,
  },
  chipText: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
  },
  chipTextActive: { color: Colors.burntOrange },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
});
