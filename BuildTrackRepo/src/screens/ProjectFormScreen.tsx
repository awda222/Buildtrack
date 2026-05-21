/**
 * Create/Edit project form with photo upload
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { Header, Input, Button } from '../components';
import { uploadProjectImage } from '../services/storageService';
import { Colors, Typography, spacing } from '../theme';
import { generateId, PROJECT_STATUSES } from '../utils/helpers';
import type { RootStackParamList } from '../navigation/types';
import type { Project, ProjectStatus } from '../types';

type Route = RouteProp<RootStackParamList, 'ProjectForm'>;

export function ProjectFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { project } = route.params ?? {};
  const { saveProject, deleteProject } = useApp();
  const isEdit = Boolean(project);

  const [name, setName] = useState(project?.name ?? '');
  const [location, setLocation] = useState(project?.location ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? 'planning'
  );
  const [progress, setProgress] = useState(project?.progress ?? 0);
  const [startDate, setStartDate] = useState(project?.startDate ?? '');
  const [endDate, setEndDate] = useState(project?.endDate ?? '');
  const [supervisorName, setSupervisorName] = useState(
    project?.supervisorName ?? ''
  );
  const [imageUri, setImageUri] = useState<string | null>(
    project?.imageUrls?.[0] ?? null
  );
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !location || !startDate) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const id = project?.id ?? generateId('proj');
      let imageUrls = project?.imageUrls ?? [];

      if (imageUri && imageUri !== project?.imageUrls?.[0]) {
        const url = await uploadProjectImage(
          id,
          imageUri,
          `photo-${Date.now()}.jpg`
        );
        imageUrls = [url];
      }

      const data: Project = {
        id,
        name,
        location,
        description,
        status,
        progress,
        startDate,
        endDate: endDate || undefined,
        supervisorName: supervisorName || undefined,
        imageUrls,
        documentUrls: project?.documentUrls,
        createdAt: project?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveProject(data);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!project) return;
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteProject(project.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={isEdit ? 'Edit Project' : 'New Project'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <Text style={styles.imagePickerText}>+ Add Site Photo</Text>
          )}
        </TouchableOpacity>

        <Input label="Project Name *" value={name} onChangeText={setName} />
        <Input
          label="Location *"
          value={location}
          onChangeText={setLocation}
        />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Supervisor Name"
          value={supervisorName}
          onChangeText={setSupervisorName}
        />
        <Input
          label="Start Date (YYYY-MM-DD) *"
          value={startDate}
          onChangeText={setStartDate}
        />
        <Input
          label="End Date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.chipRow}>
          {PROJECT_STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.chip, status === s.value && styles.chipActive]}
              onPress={() => setStatus(s.value)}
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
        <View style={styles.chipRow}>
          {[0, 25, 50, 75, 100].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, progress === p && styles.chipActive]}
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

        <Button title="Save Project" onPress={handleSave} loading={loading} />
        {isEdit && (
          <Button
            title="Delete Project"
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
  imagePicker: {
    height: 160,
    backgroundColor: Colors.steelGrey,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  imagePickerText: { color: Colors.burntOrange, fontFamily: Typography.fontFamily.medium },
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
});
