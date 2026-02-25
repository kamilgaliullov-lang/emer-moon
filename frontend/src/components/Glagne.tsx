import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Settings, Plus, MessageCircle, Users, FileText,
  Megaphone, Map, Landmark, Heart, Wrench, Leaf,
} from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';
import { useSheet } from './SheetProvider';
import ObjectCard from './ObjectCard';
import WeatherWidget from './WeatherWidget';
import { COLORS, RADIUS, SHADOW, SPHERE_COLORS } from '../utils/constants';
import type { Obj, ObjSphere } from '../utils/types';

const sphereConfig: { key: ObjSphere; Icon: any; label: string }[] = [
  { key: 'governance', Icon: Landmark, label: 'governance' },
  { key: 'social', Icon: Heart, label: 'social' },
  { key: 'infrastructure', Icon: Wrench, label: 'infrastructure' },
  { key: 'environment', Icon: Leaf, label: 'environment' },
];

export default function Glagne() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const currentMun = useAppStore((s) => s.currentMun);
  const currentMunId = useAppStore((s) => s.currentMunId);
  const user = useAppStore((s) => s.user);
  const { openSettings, openList, openObject, openCreate, openChat, openDocs, openMap } = useSheet();
  const queryClient = useQueryClient();

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news', currentMunId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obj')
        .select('*')
        .eq('obj_mun', currentMunId!)
        .eq('obj_type', 'news')
        .order('obj_date', { ascending: false });
      if (error) throw error;
      return data as Obj[];
    },
    enabled: !!currentMunId,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['news', currentMunId] });
    setRefreshing(false);
  };

  const canCreate = user && user.user_role !== 'guest';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentMun?.mun_name || 'MMuni'}
        </Text>
        <TouchableOpacity
          testID="settings-btn"
          onPress={openSettings}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Settings size={24} color={COLORS.textPrimary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <WeatherWidget coordinates={currentMun?.mun_coordinates} />

        <View style={styles.actionRow}>
          <TouchableOpacity
            testID="administration-btn"
            style={[styles.actionBtn, { backgroundColor: COLORS.primary + '12' }]}
            onPress={() => openList({ title: t('administration'), type: 'person' })}
          >
            <Users size={22} color={COLORS.primary} strokeWidth={1.5} />
            <Text style={[styles.actionLabel, { color: COLORS.primary }]}>{t('administration')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="documents-btn"
            style={[styles.actionBtn, { backgroundColor: COLORS.warning + '12' }]}
            onPress={openDocs}
          >
            <FileText size={22} color={COLORS.warning} strokeWidth={1.5} />
            <Text style={[styles.actionLabel, { color: COLORS.warning }]}>{t('documents')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="initiatives-btn"
            style={[styles.actionBtn, { backgroundColor: COLORS.success + '12' }]}
            onPress={() => openList({ title: t('initiatives'), type: 'initiative' })}
          >
            <Megaphone size={22} color={COLORS.success} strokeWidth={1.5} />
            <Text style={[styles.actionLabel, { color: COLORS.success }]}>{t('initiatives')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('organizations')}</Text>
          <View style={styles.sphereRow}>
            {sphereConfig.map(({ key, Icon, label }) => {
              const color = SPHERE_COLORS[key];
              return (
                <TouchableOpacity
                  key={key}
                  testID={`sphere-${key}-btn`}
                  style={[styles.sphereBtn, { backgroundColor: color + '16' }]}
                  onPress={() => openList({ title: t(label), type: 'organization', sphere: key })}
                >
                  <Icon size={24} color={color} strokeWidth={1.5} />
                  <Text style={[styles.sphereLabel, { color }]}>{t(label)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('events_initiatives')}</Text>
          <TouchableOpacity
            testID="events-map-btn"
            style={styles.mapThumb}
            onPress={() => openMap()}
          >
            <Map size={32} color={COLORS.textSecondary} strokeWidth={1.5} />
            <Text style={styles.mapThumbText}>{t('map_title')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('news')}</Text>
          {newsLoading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : news?.length ? (
            news.map((item) => (
              <ObjectCard key={item.obj_id} obj={item} onPress={() => openObject(item)} />
            ))
          ) : (
            <Text style={styles.emptyText}>{t('no_data')}</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.fabWrap, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity testID="ai-fab" style={[styles.fab, styles.fabLight]} onPress={openChat}>
          <MessageCircle size={24} color={COLORS.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        {canCreate && (
          <TouchableOpacity
            testID="add-fab"
            style={[styles.fab, styles.fabPrimary]}
            onPress={() => openCreate()}
          >
            <Plus size={28} color="#FFF" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.background,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, flex: 1, marginRight: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 4 },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: RADIUS.card, gap: 6, ...SHADOW.soft,
  },
  actionLabel: { fontSize: 12, fontWeight: '600' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  sphereRow: { flexDirection: 'row', gap: 8 },
  sphereBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.card, gap: 6,
  },
  sphereLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  mapThumb: {
    height: 130, backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOW.soft,
  },
  mapThumbText: { fontSize: 14, color: COLORS.textSecondary },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginTop: 20 },
  fabWrap: { position: 'absolute', right: 20, gap: 12, alignItems: 'center' },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', ...SHADOW.floating,
  },
  fabPrimary: { backgroundColor: COLORS.primary },
  fabLight: { backgroundColor: COLORS.surface },
});
