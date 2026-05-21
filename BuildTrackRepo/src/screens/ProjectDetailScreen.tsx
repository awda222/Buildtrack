/**
 * Project detail view with timeline and site materials/tasks
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header, Card, ProgressBar, MaterialCard, TaskCard, Button } from '../components';
import { Colors, Typography, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'ProjectDetail'>;

export function ProjectDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { project: initialProject } = route.params;
  const { projects, materials, tasks } = useApp();

  const project = projects.find((p) => p.id === initialProject.id) ?? initialProject;
  const projectMaterials = materials.filter((m) => m.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={project.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {project.imageUrls?.[0] && (
          <Image source={{ uri: project.imageUrls[0] }} style={styles.hero} />
        )}

        <Card glow style={styles.section}>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={16} color={Colors.burntOrange} />
            <Text style={styles.metaText}>{project.location}</Text>
          </View>
          <Text style={styles.description}>{project.description}</Text>
          <ProgressBar progress={project.progress} label="Site Progress" />
          <View style={styles.timeline}>
            <Text style={styles.timelineLabel}>Timeline</Text>
            <Text style={styles.timelineValue}>
              {project.startDate}
              {project.endDate ? ` → ${project.endDate}` : ' → Ongoing'}
            </Text>
          </View>
          {project.supervisorName && (
            <Text style={styles.supervisor}>
              Supervisor: {project.supervisorName}
            </Text>
          )}
        </Card>

        <Button
          title="Edit Project"
          variant="outline"
          onPress={() =>
            (navigation as { navigate: (a: string, b: object) => void }).navigate(
              'ProjectForm',
              { project }
            )
          }
        />

        <Text style={styles.sectionTitle}>
          Materials ({projectMaterials.length})
        </Text>
        {projectMaterials.map((m) => (
          <MaterialCard key={m.id} material={m} />
        ))}

        <Text style={styles.sectionTitle}>Tasks ({projectTasks.length})</Text>
        {projectTasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            delayed={
              t.status !== 'completed' && new Date(t.deadline) < new Date()
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  hero: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  section: { marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  metaText: { color: Colors.lightGrey, fontFamily: Typography.fontFamily.regular, fontSize: Typography.sizes.sm },
  description: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  timeline: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: Colors.graphiteBorder },
  timelineLabel: { color: Colors.lightGrey, fontSize: Typography.sizes.xs },
  timelineValue: { color: Colors.burntOrange, fontFamily: Typography.fontFamily.medium, marginTop: 4 },
  supervisor: { color: Colors.lightGrey, fontSize: Typography.sizes.sm, marginTop: spacing.sm },
  sectionTitle: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
