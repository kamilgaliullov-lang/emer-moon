import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Switch, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Globe } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, RADIUS } from '../../utils/constants';
import { updateUserProfile } from '../../services/api';
import type { Mun } from '../../utils/types';

interface Props {
  onDismiss: () => void;
}

export default function BSSettings({ onDismiss }: Props) {
  const { t, i18n } = useTranslation();
  const user = useAppStore((s) => s.user);
  const currentMun = useAppStore((s) => s.currentMun);
  const setUser = useAppStore((s) => s.setUser);
  const setCurrentMun = useAppStore((s) => s.setCurrentMun);
  const setLocale = useAppStore((s) => s.setLocale);
  const logout = useAppStore((s) => s.logout);
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.user_name || '');
  const [email, setEmail] = useState(user?.user_email || '');
  const [password, setPassword] = useState('');
  const [isActivist, setIsActivist] = useState(user?.user_role === 'activist');
  const [showMunPicker, setShowMunPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLocale(lang);
  };

  useEffect(() => {
    setName(user?.user_name || '');
    setEmail(user?.user_email || '');
    setIsActivist(user?.user_role === 'activist');
  }, [user]);

  const { data: municipalities } = useQuery({
    queryKey: ['municipalities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mun').select('*');
      if (error) throw error;
      return data as Mun[];
    },
  });

  const { data: configs } = useQuery({
    queryKey: ['configs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('config').select('*');
      if (error) throw error;
      return data as { config_key: string; config_value: string }[];
    },
  });

  const getConfig = (key: string) => configs?.find((c) => c.config_key === key)?.config_value || '';

  const countries = useMemo(() => {
    if (!municipalities) return [];
    return [...new Set(municipalities.map((m) => m.mun_country))];
  }, [municipalities]);

  const regions = useMemo(() => {
    if (!municipalities || !selectedCountry) return [];
    return [...new Set(municipalities.filter((m) => m.mun_country === selectedCountry).map((m) => m.mun_region))];
  }, [municipalities, selectedCountry]);

  const filteredMuns = useMemo(() => {
    if (!municipalities || !selectedRegion) return [];
    return municipalities.filter((m) => m.mun_region === selectedRegion);
  }, [municipalities, selectedRegion]);

  const handleSave = async () => {
    try {
      console.log('=== handleSave START ===');
      console.log('handleSave called - name:', name, 'email:', email, 'user:', !!user, 'currentMun:', currentMun?.mun_id);
      
      if (!name.trim() || !email.trim()) {
        console.log('Validation failed: name or email empty');
        Alert.alert(t('error'), t('error_name_email_required'));
        return;
      }
    try {
      if (user) {
        console.log('Updating existing user');
        const updates: any = {
          user_name: name.trim(),
          user_email: email.trim(),
          user_role: isActivist && user.user_role === 'registered' ? 'activist' :
            !isActivist && user.user_role === 'activist' ? 'registered' : user.user_role,
        };
        if (currentMun) updates.user_mun = currentMun.mun_id;
        const { error } = await supabase.from('user').update(updates).eq('user_id', user.user_id);
        if (error) throw error;
        setUser({ ...user, ...updates });
        if (password) {
          await supabase.auth.updateUser({ password });
        }
        Alert.alert(t('success'), t('success_profile_updated'));
      } else {
        console.log('New user registration path');
        if (!password) { 
          console.log('Validation failed: password empty');
          Alert.alert(t('error'), t('error_password_required')); 
          return; 
        }
        if (!currentMun?.mun_id) { 
          console.log('Validation failed: no municipality selected');
          Alert.alert(t('error'), t('error_municipality_required')); 
          return; 
        }

        console.log('Starting registration for:', email.trim(), 'with mun:', currentMun.mun_id);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              user_name: name.trim(),
              user_email: email.trim(),
              user_mun: currentMun.mun_id,
              user_role: 'registered',
            },
          },
        });
        
        console.log('Auth result:', { user: authData?.user?.id, session: !!authData?.session, error: authError });
        
        if (authError) throw authError;
        if (authData.user) {
          const newUser = {
            user_id: authData.user.id,
            user_name: name.trim(),
            user_email: email.trim(),
            user_mun: currentMun.mun_id,
            user_role: 'registered' as const,
            user_premium: false,
          };

          // Use backend API with service role key to update user profile
          // This bypasses RLS and works even without active session
          const updateProfile = async () => {
            // Small delay to let Supabase trigger create the initial record
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const result = await updateUserProfile({
              user_id: newUser.user_id,
              user_name: newUser.user_name,
              user_email: newUser.user_email,
              user_mun: newUser.user_mun,
              user_role: newUser.user_role,
              user_premium: newUser.user_premium,
            });
            
            if (result.success) {
              console.log('Successfully updated user profile via backend API');
            } else {
              console.error('Failed to update user profile via backend:', result.error);
            }
          };
          
          updateProfile().catch(console.error);

          if (authData.session) {
            setUser(newUser);
            Alert.alert(t('success'), t('success_registration_complete'));
          } else {
            Alert.alert(
              t('success'),
              t('success_registration_pending_confirmation')
            );
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (err: any) {
      Alert.alert(t('error'), err.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('delete_account'), t('confirm_delete_account'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive',
        onPress: async () => {
          if (user) {
            await supabase.from('user').delete().eq('user_id', user.user_id);
          }
          logout();
          onDismiss();
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    onDismiss();
  };

  const isGuest = !user || user.user_role === 'guest';
  const canToggleActivist = user && user.user_role !== 'guest';

  if (showMunPicker) {
    return (
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => { setShowMunPicker(false); setSelectedCountry(null); setSelectedRegion(null); }}>
          <ChevronLeft size={20} color={COLORS.primary} strokeWidth={1.5} />
          <Text style={styles.backBtnText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>
          {!selectedCountry ? t('select_country') : !selectedRegion ? t('select_region') : t('select_municipality')}
        </Text>
        {(selectedCountry || selectedRegion) && (
          <TouchableOpacity style={styles.backBtn} onPress={() => { selectedRegion ? setSelectedRegion(null) : setSelectedCountry(null); }}>
            <Text style={styles.backBtnText}>{'<'} {t('back')}</Text>
          </TouchableOpacity>
        )}
        {!selectedCountry && countries.map((c) => (
          <TouchableOpacity key={c} style={styles.listItem} onPress={() => setSelectedCountry(c)}>
            <Text style={styles.listItemText}>{c}</Text>
          </TouchableOpacity>
        ))}
        {selectedCountry && !selectedRegion && regions.map((r) => (
          <TouchableOpacity key={r} style={styles.listItem} onPress={() => setSelectedRegion(r)}>
            <Text style={styles.listItemText}>{r}</Text>
          </TouchableOpacity>
        ))}
        {selectedRegion && filteredMuns.map((m) => (
          <TouchableOpacity key={m.mun_id} style={styles.listItem} onPress={() => { setCurrentMun(m); setShowMunPicker(false); }}>
            <Text style={styles.listItemText}>{m.mun_name}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheetScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>{t('settings')}</Text>

        <Text style={styles.label}>{t('name')}</Text>
        <TextInput testID="settings-name" style={styles.input} value={name} onChangeText={setName} maxLength={50} placeholderTextColor={COLORS.textTertiary} />

        <Text style={styles.label}>{t('email')}</Text>
        <TextInput testID="settings-email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textTertiary} />

        <Text style={styles.label}>{t('password')}</Text>
        <TextInput testID="settings-password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder={user ? t('new_password_optional') : t('password')} placeholderTextColor={COLORS.textTertiary} />

        <TouchableOpacity testID="select-mun-btn" style={styles.munBtn} onPress={() => setShowMunPicker(true)}>
          <Text style={styles.munBtnLabel}>{t('select_your_municipality')}</Text>
          <Text style={styles.munBtnValue}>{currentMun?.mun_name || '—'}</Text>
        </TouchableOpacity>

        {canToggleActivist && (
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('activist_toggle')}</Text>
            <Switch
              testID="activist-toggle"
              value={isActivist}
              onValueChange={setIsActivist}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
        )}

        <View style={styles.languageSection}>
          <View style={styles.languageHeader}>
            <Globe size={20} color={COLORS.textSecondary} />
            <Text style={styles.languageLabel}>{t('language')}</Text>
          </View>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              testID="lang-en-btn"
              style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.langBtnText, i18n.language === 'en' && styles.langBtnTextActive]}>
                {t('english')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="lang-ru-btn"
              style={[styles.langBtn, i18n.language === 'ru' && styles.langBtnActive]}
              onPress={() => changeLanguage('ru')}
            >
              <Text style={[styles.langBtnText, i18n.language === 'ru' && styles.langBtnTextActive]}>
                {t('russian')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity testID="save-btn" style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('save_changes')}</Text>
        </TouchableOpacity>

        <View style={styles.links}>
          <TouchableOpacity onPress={() => { const e = getConfig('verify_email'); if (e) Linking.openURL(`mailto:${e}`); }}>
            <Text style={styles.linkText}>{t('verify_mayor')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { const e = getConfig('support_email'); if (e) Linking.openURL(`mailto:${e}`); }}>
            <Text style={styles.linkText}>{t('support')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { const u = getConfig('appsite_url'); if (u) Linking.openURL(u); }}>
            <Text style={styles.linkText}>{t('legal_info')}</Text>
          </TouchableOpacity>
        </View>

        {isGuest ? (
          <Text style={styles.guestMsg}>{getConfig('login_message') || t('guest_info')}</Text>
        ) : (
          <>
            <TouchableOpacity testID="logout-btn" style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>{t('logout')}</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="delete-account-btn" style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Text style={styles.deleteBtnText}>{t('delete_account')}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Always show option to change municipality / go back to StartScreen */}
        <TouchableOpacity 
          testID="change-mun-btn" 
          style={styles.changeMunBtn} 
          onPress={() => {
            setCurrentMun(null);
            onDismiss();
          }}
        >
          <Text style={styles.changeMunBtnText}>{t('change_municipality')}</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.button,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.textPrimary,
  },
  munBtn: {
    marginTop: 14, backgroundColor: COLORS.background, borderRadius: RADIUS.button,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  munBtnLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  munBtnValue: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, paddingVertical: 8,
  },
  toggleLabel: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '500' },
  saveBtn: {
    marginTop: 24, height: 50, borderRadius: RADIUS.card,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: '#FFF' },
  links: { marginTop: 24, gap: 16 },
  linkText: { fontSize: 16, color: COLORS.primary, fontWeight: '500' },
  guestMsg: { marginTop: 24, fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  logoutBtn: {
    marginTop: 16, height: 50, borderRadius: RADIUS.card,
    backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center',
  },
  logoutBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.textSecondary },
  deleteBtn: {
    marginTop: 12, height: 50, borderRadius: RADIUS.card,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.destructive },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 4 },
  backBtnText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  listItem: {
    paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border,
  },
  listItemText: { fontSize: 17, color: COLORS.textPrimary },
  languageSection: { marginTop: 20 },
  languageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  languageLabel: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  languageButtons: { flexDirection: 'row', gap: 12 },
  langBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.button,
    backgroundColor: COLORS.background, alignItems: 'center',
  },
  langBtnActive: { backgroundColor: COLORS.primary },
  langBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  langBtnTextActive: { color: '#FFF' },
  changeMunBtn: {
    marginTop: 20, height: 50, borderRadius: RADIUS.card,
    backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  changeMunBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.textSecondary },
});
