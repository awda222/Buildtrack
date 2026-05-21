/**
 * Multi-site project management screen
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header, Card, ProgressBar, EmptyState } from '../components';
import { Colors, Typography, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Project } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_COLORS: Record<string, string> = {
  planning: Colors.info,
  active: Colors.burntOrange,
  on_hold: Colors.warning,
  completed: Colors.success,
};

function ProjectListItem({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="business" size={24} color={Colors.burntOrange} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{project.name}</Text>
          <Text style={styles.location}>{project.location}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${STATUS_COLORS[project.status]}22` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: STATUS_COLORS[project.status] }]}
          >
            {project.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: spacing.md }}>
        <ProgressBar progress={project.progress} label="Site Progress" />
      </View>
      {project.supervisorName && (
        <Text style={styles.supervisor}>
          Supervisor: {project.supervisorName}
        </Text>
      )}
    </Card>
  );
}

export function ProjectsScreen() {
  const navigation = useNavigation<Nav>();
  const { projects } = useApp();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Projects"
        subtitle={`${projects.length} construction sites`}
        rightAction={{
          icon: 'add-circle',
          onPress: () => navigation.navigate('ProjectForm', {}),
        }}
      />
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProjectListItem
            project={item}
            onPress={() =>
              navigation.navigate('ProjectDetail', { project: item })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="business-outline"
            title="No Projects"
            message="Create your first construction project"
            actionLabel="Add Project"
            onAction={() => navigation.navigate('ProjectForm', {})}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
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
  info: { flex: 1 },
  name: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
  },
  location: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  supervisor: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: spacing.sm,
    fontFamily: Typography.fontFamily.regular,
  },
});
