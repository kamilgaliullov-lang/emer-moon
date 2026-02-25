import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useAppStore } from '../../store/useAppStore';
import { useSheet } from '../SheetProvider';
import ObjectCard from '../ObjectCard';
import { COLORS, RADIUS, SPHERE_COLORS } from '../../utils/constants';
import type { Obj, MapOptions } from '../../utils/types';

interface Props {
  options: MapOptions;
  onDismiss: () => void;
}

export default function BSMap({ options, onDismiss }: Props) {
  const { t } = useTranslation();
  const currentMun = useAppStore((s) => s.currentMun);
  const currentMunId = useAppStore((s) => s.currentMunId);
  const { openObject } = useSheet();

  const { data: objects } = useQuery({
    queryKey: ['all-objects', currentMunId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obj')
        .select('*')
        .eq('obj_mun', currentMunId!);
      if (error) throw error;
      return data as Obj[];
    },
    enabled: !!currentMunId,
  });

  const objectsWithCoords = objects?.filter((o) => o.obj_coordinates) || [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('map_title')}</Text>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>
          {currentMun?.mun_coordinates
            ? `Map centered at ${currentMun.mun_coordinates.lat.toFixed(2)}, ${currentMun.mun_coordinates.lng.toFixed(2)}`
            : 'Map view'}
        </Text>
        <Text style={styles.mapSubText}>
          {options.selectMode
            ? 'Long press on map to select coordinates'
            : `${objectsWithCoords.length} pins on map`}
        </Text>
        {options.selectMode && (
          <Text style={styles.mapNote}>
            (Map requires native build - use coordinates input for now)
          </Text>
        )}
      </View>

      {!options.selectMode && (
        <BottomSheetScrollView contentContainerStyle={styles.list}>
          <Text style={styles.listTitle}>
            Objects ({objectsWithCoords.length})
          </Text>
          {objectsWithCoords.map((obj) => (
            <ObjectCard key={obj.obj_id} obj={obj} onPress={() => openObject(obj)} />
          ))}
        </BottomSheetScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 22, fontWeight: '700', color: COLORS.textPrimary,
    paddingHorizontal: 20, paddingBottom: 12,
  },
  mapPlaceholder: {
    marginHorizontal: 20, height: 200, backgroundColor: COLORS.background,
    borderRadius: RADIUS.card, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  mapPlaceholderText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  mapSubText: { fontSize: 13, color: COLORS.textTertiary, marginTop: 4 },
  mapNote: { fontSize: 12, color: COLORS.textTertiary, marginTop: 8, fontStyle: 'italic' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  listTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
});
