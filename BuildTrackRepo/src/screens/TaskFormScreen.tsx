/**
 * Create/Edit task form
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Header, Input, Button, ProgressBar } from '../components';
import { Colors, Typography, spacing } from '../theme';
import { generateId, TASK_STATUSES } from '../utils/helpers';
import type { RootStackParamList } from '../navigation/types';
import type { Task, TaskStatus } from '../types';

type Route = RouteProp<RootStackParamList, 'TaskForm'>;

export function TaskFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { task } = route.params ?? {};
  const { projects, saveTask, deleteTask } = useApp();
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'pending');
  const [assignedTo, setAssignedTo] = useState(task?.assignedToName ?? '');
  const [deadline, setDeadline] = useState(task?.deadline ?? '');
  const [progress, setProgress] = useState(task?.progress ?? 0);
  const [projectId, setProjectId] = useState(
    task?.projectId ?? projects[0]?.id ?? ''
  );
  const [loading, setLoading] = useState(false);

  const selectedProject = projects.find((p) => p.id === projectId);

  const handleSave = async () => {
    if (!title || !deadline || !projectId) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const data: Task = {
        id: task?.id ?? generateId('task'),
        title,
        description,
        status,
        assignedTo: task?.assignedTo ?? 'user-assign',
        assignedToName: assignedTo || 'Unassigned',
        projectId,
        projectName: selectedProject?.name,
        deadline,
        progress: status === 'completed' ? 100 : progress,
        createdAt: task?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveTask(data);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(task.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={isEdit ? 'Edit Task' : 'Create Task'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Input label="Task Title *" value={title} onChangeText={setTitle} />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Assigned To"
          value={assignedTo}
          onChangeText={setAssignedTo}
          placeholder="Supervisor name"
        />
        <Input
          label="Deadline (YYYY-MM-DD) *"
          value={deadline}
          onChangeText={setDeadline}
          placeholder="2025-06-01"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.chipRow}>
          {TASK_STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.chip, status === s.value && styles.chipActive]}
              onPress={() => {
                setStatus(s.value);
                if (s.value === 'completed') setProgress(100);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  status === s.value && styles.chipTextActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Progress: {progress}%</Text>
        <View style={styles.progressRow}>
          {[0, 25, 50, 75, 100].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.progressChip, progress === p && styles.chipActive]}
              onPress={() => setProgress(p)}
            >
              <Text
                style={[
                  styles.chipText,
                  progress === p && styles.chipTextActive,
                ]}
              >
                {p}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ProgressBar progress={progress} />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Project *</Text>
        <View style={styles.chipRow}>
          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.chip, projectId === p.id && styles.chipActive]}
              onPress={() => setProjectId(p.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  projectId === p.id && styles.chipTextActive,
                ]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Save Task" onPress={handleSave} loading={loading} />
        {isEdit && (
          <Button
            title="Delete Task"
            variant="danger"
            onPress={handleDelete}
            style={{ marginTop: spacing.md }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.steelGrey,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
  chipActive: {
    borderColor: Colors.burntOrange,
    backgroundColor: Colors.orangeGlow,
  },
  chipText: { color: Colors.lightGrey, fontSize: Typography.sizes.sm },
  chipTextActive: { color: Colors.burntOrange },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  progressChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.steelGrey,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
  },
});
