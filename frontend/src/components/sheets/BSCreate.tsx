import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabase';
import { useAppStore } from '../../store/useAppStore';
import { useSheet } from '../SheetProvider';
import { COLORS, RADIUS, SPHERE_COLORS } from '../../utils/constants';
import type { Obj, ObjType, ObjSphere } from '../../utils/types';

const OBJ_TYPES: ObjType[] = ['organization', 'news', 'event', 'person', 'initiative'];
const OBJ_SPHERES: ObjSphere[] = ['governance', 'social', 'infrastructure', 'environment'];

interface Props {
  editObj?: Obj | null;
  onDismiss: () => void;
}

export default function BSCreate({ editObj, onDismiss }: Props) {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const currentMunId = useAppStore((s) => s.currentMunId);
  const queryClient = useQueryClient();
  const { openMap } = useSheet();

  const [objType, setObjType] = useState<ObjType | ''>('');
  const [objSphere, setObjSphere] = useState<ObjSphere | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (editObj) {
      setObjType(editObj.obj_type);
      setObjSphere(editObj.obj_sphere);
      setTitle(editObj.obj_title);
      setDescription(editObj.obj_description || '');
      setPhotoUrl(editObj.obj_photo || '');
      setCoords(editObj.obj_coordinates || null);
    } else {
      setObjType('');
      setObjSphere('');
      setTitle('');
      setDescription('');
      setPhotoUrl('');
      setCoords(null);
    }
  }, [editObj]);

  const canCreateType = (type: ObjType): boolean => {
    if (!user || user.user_role === 'guest') return false;
    if (type === 'person') return user.user_role === 'admin' || user.user_role === 'superadmin';
    if (type === 'initiative') return user.user_role === 'activist' || user.user_role === 'admin' || user.user_role === 'superadmin';
    if (type === 'news') return user.user_role === 'admin' || user.user_role === 'superadmin';
    return true;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!objType || !objSphere || !title.trim()) {
        throw new Error('Please fill required fields');
      }
      const payload = {
        obj_mun: currentMunId,
        obj_type: objType,
        obj_sphere: objSphere,
        obj_title: title.trim(),
        obj_description: description.trim() || null,
        obj_photo: photoUrl.trim() || null,
        obj_coordinates: coords,
        obj_date: new Date().toISOString(),
        obj_author: user?.user_id || null,
        obj_likes: [],
        obj_dislikes: [],
        obj_reports: [],
        obj_sort_order: 0,
      };
      if (editObj) {
        const { error } = await supabase.from('obj').update(payload).eq('obj_id', editObj.obj_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('obj').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      onDismiss();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message);
    },
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>{editObj ? t('edit') : t('create')}</Text>

        <Text style={styles.label}>{t('obj_type')} *</Text>
        <View style={styles.chipRow}>
          {OBJ_TYPES.filter((tp) => canCreateType(tp)).map((tp) => (
            <TouchableOpacity
              key={tp}
              testID={`type-${tp}`}
              style={[styles.chip, objType === tp && styles.chipActive]}
              onPress={() => setObjType(tp)}
            >
              <Text style={[styles.chipText, objType === tp && styles.chipTextActive]}>{t(tp)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('obj_sphere')} *</Text>
        <View style={styles.chipRow}>
          {OBJ_SPHERES.map((sp) => (
            <TouchableOpacity
              key={sp}
              testID={`sphere-${sp}`}
              style={[
                styles.chip,
                objSphere === sp && { backgroundColor: SPHERE_COLORS[sp], borderColor: SPHERE_COLORS[sp] },
              ]}
              onPress={() => setObjSphere(sp)}
            >
              <Text style={[styles.chipText, objSphere === sp && { color: '#FFF' }]}>{t(sp)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('obj_title')} *</Text>
        <TextInput
          testID="create-title-input"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          maxLength={50}
          placeholder={t('obj_title')}
          placeholderTextColor={COLORS.textTertiary}
        />

        <Text style={styles.label}>{t('obj_description')}</Text>
        <TextInput
          testID="create-desc-input"
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          maxLength={2000}
          multiline
          placeholder={t('obj_description')}
          placeholderTextColor={COLORS.textTertiary}
        />

        <Text style={styles.label}>{t('obj_photo')}</Text>
        <TextInput
          testID="create-photo-input"
          style={styles.input}
          value={photoUrl}
          onChangeText={setPhotoUrl}
          placeholder="https://..."
          placeholderTextColor={COLORS.textTertiary}
          autoCapitalize="none"
        />

        <TouchableOpacity
          testID="select-coords-btn"
          style={styles.coordBtn}
          onPress={() =>
            openMap({
              selectMode: true,
              onSelect: (c) => setCoords(c),
            })
          }
        >
          <Text style={styles.coordBtnText}>
            {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : t('select_on_map')}
          </Text>
        </TouchableOpacity>

        <View style={styles.btnRow}>
          <TouchableOpacity testID="cancel-btn" style={styles.cancelBtn} onPress={onDismiss}>
            <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="save-btn"
            style={styles.saveBtn}
            onPress={() => saveMutation.mutate()}
          >
            <Text style={styles.saveBtnText}>{editObj ? t('update') : t('create')}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, marginTop: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  chipTextActive: { color: '#FFF' },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.button,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.textPrimary,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  coordBtn: {
    marginTop: 14, backgroundColor: COLORS.background, borderRadius: RADIUS.button,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  coordBtnText: { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: RADIUS.card, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  cancelBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: {
    flex: 1, height: 50, borderRadius: RADIUS.card, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: '#FFF' },
});
