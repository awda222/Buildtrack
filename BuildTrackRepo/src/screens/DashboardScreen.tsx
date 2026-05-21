/**
 * Main dashboard — projects, materials, tasks, AI insights, activity feed
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Header,
  StatCard,
  Card,
  ProgressBar,
  ActivityFeedItem,
} from '../components';
import { Colors, Typography, spacing } from '../theme';
import { ENV } from '../config/env';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const {
    projects,
    materials,
    tasks,
    activities,
    insights,
    lowStockMaterials,
    delayedTasks,
    unreadCount,
    loading,
    refresh,
  } = useApp();

  const activeProjects = projects.filter((p) => p.status === 'active');
  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((s, p) => s + p.progress, 0) / projects.length
        )
      : 0;
  const ongoingTasks = tasks.filter((t) => t.status === 'in_progress');

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title={`Hello, ${user?.displayName?.split(' ')[0] ?? 'Builder'}`}
        subtitle="BuildTrack Dashboard"
        rightAction={{
          icon: 'notifications-outline',
          onPress: () => navigation.navigate('Notifications'),
          badge: unreadCount,
        }}
      />

      {ENV.demoMode && (
        <View style={styles.demoRibbon}>
          <Ionicons name="construct" size={16} color={Colors.burntOrange} />
          <Text style={styles.demoRibbonText}>
            Demo mode — live sample sites, crews, and inventory
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={Colors.burntOrange}
          />
        }
      >
        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Active Projects"
            value={activeProjects.length}
            icon="business"
          />
          <StatCard
            title="Materials Tracked"
            value={materials.length}
            icon="cube"
            alert={lowStockMaterials.length > 0}
            subtitle={
              lowStockMaterials.length > 0
                ? `${lowStockMaterials.length} low stock`
                : undefined
            }
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Ongoing Tasks"
            value={ongoingTasks.length}
            icon="checkbox"
          />
          <StatCard
            title="Delayed Tasks"
            value={delayedTasks.length}
            icon="time"
            alert={delayedTasks.length > 0}
          />
        </View>

        {/* Low-stock spotlight */}
        {lowStockMaterials.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Supply alerts</Text>
            <Text style={styles.sectionSub}>
              {lowStockMaterials.length} SKUs below reorder thresholds across active jobs
            </Text>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.supplyStrip}
            >
              {lowStockMaterials.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Materials')}
                >
                  <Card style={styles.supplyCard} glow>
                    <Text style={styles.supplyName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.supplyMeta}>
                      {item.quantity} {item.unit}
                      <Text style={styles.supplySep}> · </Text>
                      min {item.minThreshold}
                    </Text>
                    <Text style={styles.supplySite}>Reorder soon</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Overall progress */}
        <Card style={styles.section} glow>
          <Text style={styles.sectionTitle}>Overall Project Progress</Text>
          <ProgressBar progress={avgProgress} label="All Sites Average" />
        </Card>

        {/* Active projects */}
        <Text style={styles.sectionHeader}>Active Projects</Text>
        {activeProjects.slice(0, 3).map((project) => (
          <Card
            key={project.id}
            style={styles.projectCard}
            onPress={() =>
              navigation.navigate('ProjectDetail', { project })
            }
          >
            <View style={styles.projectRow}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectLoc}>{project.location}</Text>
              </View>
              <Text style={styles.projectPct}>{project.progress}%</Text>
            </View>
            <ProgressBar
              progress={project.progress}
              showPercent={false}
              height={6}
            />
          </Card>
        ))}

        {/* AI Insights */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>AI Project Insights</Text>
          <Ionicons name="sparkles" size={18} color={Colors.burntOrange} />
        </View>
        {insights.slice(0, 3).map((insight) => (
          <Card
            key={insight.id}
            style={styles.insightCard}
            glow={insight.priority === 'high'}
          >
            <View style={styles.insightHeader}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <View
                style={[
                  styles.priorityBadge,
                  insight.priority === 'high' && styles.priorityHigh,
                ]}
              >
                <Text style={styles.priorityText}>
                  {insight.priority.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.insightSummary}>{insight.summary}</Text>
          </Card>
        ))}

        {/* Activity feed */}
        <Text style={styles.sectionHeader}>Recent Activity</Text>
        <Card style={styles.section}>
          {activities.length === 0 ? (
            <Text style={styles.emptyFeed}>No recent activity logged.</Text>
          ) : (
            activities.map((item) => (
              <ActivityFeedItem key={item.id} item={item} />
            ))
          )}
        </Card>

        {/* Quick AI access */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigation.navigate('AIAssistant')}
        >
          <Ionicons name="sparkles" size={24} color={Colors.burntOrange} />
          <View style={styles.aiBannerText}>
            <Text style={styles.aiBannerTitle}>Ask BuildTrack AI</Text>
            <Text style={styles.aiBannerSub}>
              "How much cement is left?" · "Which tasks are delayed?"
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.lightGrey} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  demoRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.orangeGlow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.35)',
  },
  demoRibbonText: {
    flex: 1,
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  statsRow: { flexDirection: 'row', marginHorizontal: -spacing.xs },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionSub: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: spacing.sm,
    marginTop: -4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  supplyStrip: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  supplyCard: {
    width: 200,
    marginRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  supplyName: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.sm,
    minHeight: 36,
  },
  supplyMeta: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  supplySep: { color: Colors.steelGrey },
  supplySite: {
    color: Colors.burntOrange,
    fontSize: Typography.sizes.xs,
    marginTop: spacing.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  emptyFeed: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    paddingVertical: spacing.sm,
  },
  projectCard: { marginBottom: spacing.sm },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  projectInfo: { flex: 1 },
  projectName: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
  },
  projectLoc: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  projectPct: {
    color: Colors.burntOrange,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.lg,
  },
  insightCard: { marginBottom: spacing.sm },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightTitle: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: Colors.steelGrey,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityHigh: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  priorityText: {
    color: Colors.burntOrange,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  insightSummary: {
    color: Colors.lightGrey,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.steelGrey,
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: Colors.burntOrange,
    gap: spacing.md,
  },
  aiBannerText: { flex: 1 },
  aiBannerTitle: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
  },
  aiBannerSub: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
});
