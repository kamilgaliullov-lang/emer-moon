import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FileText, Download } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, RADIUS, SHADOW } from '../../utils/constants';
import type { Doc } from '../../utils/types';

export default function BSDocs() {
  const { t } = useTranslation();
  const currentMunId = useAppStore((s) => s.currentMunId);
  const user = useAppStore((s) => s.user);
  const isAdmin = user && (user.user_role === 'admin' || user.user_role === 'superadmin');

  const { data: docs, isLoading } = useQuery({
    queryKey: ['docs', currentMunId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doc')
        .select('*')
        .eq('doc_mun', currentMunId!)
        .order('doc_date', { ascending: false });
      if (error) throw error;
      return data as Doc[];
    },
    enabled: !!currentMunId,
  });

  const openDoc = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('municipal_documents')}</Text>
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <BottomSheetScrollView contentContainerStyle={styles.list}>
          {docs?.length ? (
            docs.map((doc) => (
              <TouchableOpacity
                key={doc.doc_id}
                testID={`doc-${doc.doc_id}`}
                style={styles.docItem}
                onPress={() => openDoc(doc.doc_url)}
              >
                <FileText size={24} color={COLORS.primary} strokeWidth={1.5} />
                <View style={styles.docContent}>
                  <Text style={styles.docTitle} numberOfLines={2}>
                    {doc.doc_title}
                  </Text>
                  <Text style={styles.docDate}>
                    {doc.doc_date ? new Date(doc.doc_date).toLocaleDateString() : ''}
                  </Text>
                </View>
              </TouchableOpacity>
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
  docItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: 16, marginBottom: 10, ...SHADOW.soft,
  },
  docContent: { flex: 1 },
  docTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  docDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  empty: {
    fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginTop: 40,
  },
});
