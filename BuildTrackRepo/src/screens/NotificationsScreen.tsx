/**
 * Notifications screen — low stock, deadlines, AI warnings
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
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header, Card, EmptyState, Button } from '../components';
import { Colors, Typography, spacing } from '../theme';
import type { Notification } from '../types';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  low_stock: 'cube',
  deadline: 'time',
  ai_warning: 'sparkles',
  project_update: 'business',
  task: 'checkbox',
};

const TYPE_COLORS: Record<string, string> = {
  low_stock: Colors.danger,
  deadline: Colors.warning,
  ai_warning: Colors.burntOrange,
  project_update: Colors.info,
  task: Colors.success,
};

function NotificationItem({
  item,
  onPress,
}: {
  item: Notification;
  onPress: () => void;
}) {
  const icon = TYPE_ICONS[item.type] ?? 'notifications';
  const color = TYPE_COLORS[item.type] ?? Colors.burntOrange;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={[styles.card, !item.read && styles.unread]}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {!item.read && <View style={styles.dot} />}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export function NotificationsScreen() {
  const navigation = useNavigation();
  const { notifications, markNotificationRead, refresh } = useApp();

  const handlePress = async (item: Notification) => {
    if (!item.read) await markNotificationRead(item.id);
  };

  const markAllRead = async () => {
    for (const n of notifications.filter((x) => !x.read)) {
      await markNotificationRead(n.id);
    }
    await refresh();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Notifications"
        subtitle={`${notifications.filter((n) => !n.read).length} unread`}
        onBack={() => navigation.goBack()}
      />

      {notifications.some((n) => !n.read) && (
        <Button
          title="Mark All Read"
          variant="outline"
          onPress={markAllRead}
          style={styles.markAll}
        />
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={() => handlePress(item)} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title="No Notifications"
            message="You're all caught up!"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  markAll: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.sm },
  unread: { borderColor: Colors.burntOrange },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  title: {
    color: Colors.softWhite,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.sizes.md,
  },
  message: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.sm,
    marginTop: 4,
    lineHeight: 20,
    fontFamily: Typography.fontFamily.regular,
  },
  time: {
    color: Colors.lightGrey,
    fontSize: Typography.sizes.xs,
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.burntOrange,
    marginLeft: spacing.sm,
    marginTop: 4,
  },
});
