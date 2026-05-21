/**
 * Add/Edit material form
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
import { Header, Input, Button } from '../components';
import { Colors, Typography, spacing } from '../theme';
import { generateId, MATERIAL_CATEGORIES } from '../utils/helpers';
import type { RootStackParamList } from '../navigation/types';
import type { Material, MaterialCategory } from '../types';

type Route = RouteProp<RootStackParamList, 'MaterialForm'>;

export function MaterialFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { material } = route.params ?? {};
  const { projects, saveMaterial, deleteMaterial } = useApp();
  const isEdit = Boolean(material);

  const [name, setName] = useState(material?.name ?? '');
  const [category, setCategory] = useState<MaterialCategory>(
    material?.category ?? 'cement'
  );
  const [quantity, setQuantity] = useState(String(material?.quantity ?? ''));
  const [unit, setUnit] = useState(material?.unit ?? 'units');
  const [minThreshold, setMinThreshold] = useState(
    String(material?.minThreshold ?? '')
  );
  const [projectId, setProjectId] = useState(
    material?.projectId ?? projects[0]?.id ?? ''
  );
  const [supplier, setSupplier] = useState(material?.supplier ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !quantity || !minThreshold || !projectId) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const data: Material = {
        id: material?.id ?? generateId('mat'),
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        minThreshold: parseFloat(minThreshold),
        projectId,
        supplier: supplier || undefined,
        lastUpdated: new Date().toISOString(),
        usageHistory: material?.usageHistory,
      };
      await saveMaterial(data);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save material');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!material) return;
    Alert.alert('Delete Material', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMaterial(material.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={isEdit ? 'Edit Material' : 'Add Material'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Input label="Material Name *" value={name} onChangeText={setName} />
        <Text style={styles.label}>Category *</Text>
        <View style={styles.chipRow}>
          {MATERIAL_CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.chip, category === c.value && styles.chipActive]}
              onPress={() => setCategory(c.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === c.value && styles.chipTextActive,
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input
          label="Quantity *"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <Input label="Unit" value={unit} onChangeText={setUnit} />
        <Input
          label="Minimum Threshold *"
          value={minThreshold}
          onChangeText={setMinThreshold}
          keyboardType="numeric"
        />
        <Input label="Supplier" value={supplier} onChangeText={setSupplier} />

        <Text style={styles.label}>Project *</Text>
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

        <Button title="Save Material" onPress={handleSave} loading={loading} />
        {isEdit && (
          <Button
            title="Delete Material"
            variant="danger"
            onPress={handleDelete}
            style={styles.deleteBtn}
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
  deleteBtn: { marginTop: spacing.md },
});
