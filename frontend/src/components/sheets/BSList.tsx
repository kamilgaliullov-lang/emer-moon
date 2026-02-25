import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabase';
import { useAppStore } from '../../store/useAppStore';
import { useSheet } from '../SheetProvider';
import ObjectCard from '../ObjectCard';
import { COLORS } from '../../utils/constants';
import type { Obj, ListFilter } from '../../utils/types';

interface Props {
  filter: ListFilter;
}

export default function BSList({ filter }: Props) {
  const { t } = useTranslation();
  const currentMunId = useAppStore((s) => s.currentMunId);
  const { openObject } = useSheet();

  const { data: objects, isLoading } = useQuery({
    queryKey: ['objects', currentMunId, filter.type, filter.sphere],
    queryFn: async () => {
      let query = supabase.from('obj').select('*').eq('obj_mun', currentMunId!);
      if (filter.type) query = query.eq('obj_type', filter.type);
      if (filter.sphere) query = query.eq('obj_sphere', filter.sphere);
      const { data, error } = await query
        .order('obj_sort_order', { ascending: true })
        .order('obj_date', { ascending: false });
      if (error) throw error;
      return data as Obj[];
    },
    enabled: !!currentMunId,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{filter.title}</Text>
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <BottomSheetScrollView contentContainerStyle={styles.list}>
          {objects?.length ? (
            objects.map((obj) => (
              <ObjectCard key={obj.obj_id} obj={obj} onPress={() => openObject(obj)} />
            ))
          ) : (
            <Text style={styles.empty}>{t('no_data')}</Text>
          )}
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
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: {
    fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginTop: 40,
  },
});
