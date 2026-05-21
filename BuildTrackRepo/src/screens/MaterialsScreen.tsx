/**
 * Smart material tracking screen with search and filters
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header, MaterialCard, EmptyState } from '../components';
import { Colors, Typography, spacing } from '../theme';
import { MATERIAL_CATEGORIES } from '../utils/helpers';
import type { RootStackParamList } from '../navigation/types';
import type { MaterialCategory } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MaterialsScreen() {
  const navigation = useNavigation<Nav>();
  const { materials, lowStockMaterials } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MaterialCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.includes(search.toLowerCase());
      const matchFilter = filter === 'all' || m.category === filter;
      return matchSearch && matchFilter;
    });
  }, [materials, search, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Materials"
        subtitle={`${materials.length} tracked · ${lowStockMaterials.length} low stock`}
        rightAction={{
          icon: 'add-circle',
          onPress: () => navigation.navigate('MaterialForm', {}),
        }}
      />

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color={Colors.lightGrey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials..."
          placeholderTextColor={Colors.lightGrey}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category filters */}
      <FlatList
        horizontal
        data={[{ value: 'all' as const, label: 'All' }, ...MATERIAL_CATEGORIES]}
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
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MaterialCard
            material={item}
            onPress={() =>
              navigation.navigate('MaterialForm', { material: item })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="No Materials"
            message="Add materials to start tracking inventory"
            actionLabel="Add Material"
            onAction={() => navigation.navigate('MaterialForm', {})}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.matteBlack },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.steelGrey,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: Colors.graphiteBorder,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.softWhite,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.md,
  },
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
