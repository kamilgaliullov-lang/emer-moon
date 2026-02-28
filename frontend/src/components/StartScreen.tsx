import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Globe, Shuffle, ChevronLeft } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';
import { useSheet } from './SheetProvider';
import { COLORS, RADIUS, SHADOW } from '../utils/constants';
import type { Mun } from '../utils/types';

export default function StartScreen() {
  const { t } = useTranslation();
  const setCurrentMun = useAppStore((s) => s.setCurrentMun);
  const setUser = useAppStore((s) => s.setUser);
  const { openSettings } = useSheet();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const munChooseRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%'], []);

  const { data: municipalities } = useQuery({
    queryKey: ['municipalities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mun').select('*');
      if (error) throw error;
      return data as Mun[];
    },
  });

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const countries = useMemo(() => {
    if (!municipalities) return [];
    return [...new Set(municipalities.map((m) => m.mun_country))];
  }, [municipalities]);

  const regions = useMemo(() => {
    if (!municipalities || !selectedCountry) return [];
    return [
      ...new Set(
        municipalities.filter((m) => m.mun_country === selectedCountry).map((m) => m.mun_region)
      ),
    ];
  }, [municipalities, selectedCountry]);

  const filteredMuns = useMemo(() => {
    if (!municipalities || !selectedRegion) return [];
    return municipalities.filter((m) => m.mun_region === selectedRegion);
  }, [municipalities, selectedRegion]);

  const handleSelectMun = (mun: Mun) => {
    setCurrentMun(mun);
    munChooseRef.current?.dismiss();
  };

  const handleRandomMun = async () => {
    try {
      const { data: config } = await supabase
        .from('config')
        .select('*')
        .eq('config_key', 'demo_mun')
        .single();
      if (config?.config_value && municipalities) {
        const demoMun = municipalities.find((m) => m.mun_id === config.config_value);
        if (demoMun) { setCurrentMun(demoMun); return; }
      }
      if (municipalities?.length) setCurrentMun(municipalities[0]);
    } catch {
      if (municipalities?.length) setCurrentMun(municipalities[0]);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert(t('error'), t('error_email_password_required')); return; }
    setLoading(true);
    try {
      console.log('Attempting login with email:', email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('No user returned from auth');
        throw new Error('Login failed - no user data');
      }

      const fallbackUser = {
        user_id: authData.user.id,
        user_name: authData.user.email?.split('@')[0] || 'User',
        user_email: authData.user.email || '',
        user_mun: null,
        user_role: 'registered' as const,
        user_premium: false,
      };
      // Keep user signed in even if profile table read/write fails.
      setUser(fallbackUser);
      
      console.log('Auth successful, user id:', authData.user.id);
      
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        // User authenticated but no profile - create one
        if (userError.code === 'PGRST116') { // No rows returned
          console.log('No user profile found, creating one...');
          const { error: insertError } = await supabase.from('user').upsert(fallbackUser, { onConflict: 'user_id' });
          if (!insertError) {
            Alert.alert(t('success'), t('success_profile_updated'));
          }
        }
      }
      
      console.log('User data fetched:', userData?.user_email);
      
      if (userData) {
        setUser(userData);
        if (userData.user_mun) {
          const { data: munData } = await supabase
            .from('mun')
            .select('*')
            .eq('mun_id', userData.user_mun)
            .single();
          if (munData) {
            console.log('Setting municipality:', munData.mun_name);
            setCurrentMun(munData);
          }
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = t('error_login_failed');
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. If you registered recently, please check your email for verification link.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert(t('error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const resetMunChoose = () => {
    setSelectedCountry(null);
    setSelectedRegion(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <MapPin size={40} color={COLORS.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>{t('app_name')}</Text>
            <Text style={styles.subtitle}>{t('app_subtitle')}</Text>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              testID="my-municipality-btn"
              style={[styles.button, styles.primaryButton]}
              onPress={() => { resetMunChoose(); munChooseRef.current?.present(); }}
            >
              <Globe size={20} color="#FFF" strokeWidth={1.5} />
              <Text style={styles.primaryButtonText}>{t('my_municipality')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="random-municipality-btn"
              style={[styles.button, styles.outlineButton]}
              onPress={handleRandomMun}
            >
              <Shuffle size={20} color={COLORS.primary} strokeWidth={1.5} />
              <Text style={styles.outlineButtonText}>{t('random_municipality')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="register-btn"
              style={[styles.button, styles.outlineButton]}
              onPress={openSettings}
            >
              <Text style={styles.outlineButtonText}>{t('register')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginSection}>
            <Text style={styles.sectionTitle}>{t('login')}</Text>
            <TextInput
              testID="login-email-input"
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor={COLORS.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              testID="login-password-input"
              style={styles.input}
              placeholder={t('password')}
              placeholderTextColor={COLORS.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              testID="login-submit-btn"
              style={[styles.button, styles.primaryButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('enter')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheetModal
        ref={munChooseRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <Text style={styles.sheetTitle}>
            {!selectedCountry
              ? t('select_country')
              : !selectedRegion
                ? t('select_region')
                : t('select_municipality')}
          </Text>

          {(selectedCountry || selectedRegion) && (
            <TouchableOpacity
              testID="mun-choose-back-btn"
              style={styles.backBtn}
              onPress={() => {
                if (selectedRegion) setSelectedRegion(null);
                else setSelectedCountry(null);
              }}
            >
              <ChevronLeft size={20} color={COLORS.primary} strokeWidth={1.5} />
              <Text style={styles.backBtnText}>{t('back')}</Text>
            </TouchableOpacity>
          )}

          {!selectedCountry &&
            countries.map((country) => (
              <TouchableOpacity
                key={country}
                testID={`country-${country}`}
                style={styles.listItem}
                onPress={() => setSelectedCountry(country)}
              >
                <Text style={styles.listItemText}>{country}</Text>
              </TouchableOpacity>
            ))}

          {selectedCountry &&
            !selectedRegion &&
            regions.map((region) => (
              <TouchableOpacity
                key={region}
                testID={`region-${region}`}
                style={styles.listItem}
                onPress={() => setSelectedRegion(region)}
              >
                <Text style={styles.listItemText}>{region}</Text>
              </TouchableOpacity>
            ))}

          {selectedRegion &&
            filteredMuns.map((mun) => (
              <TouchableOpacity
                key={mun.mun_id}
                testID={`mun-${mun.mun_id}`}
                style={styles.listItem}
                onPress={() => handleSelectMun(mun)}
              >
                <Text style={styles.listItemText}>{mun.mun_name}</Text>
              </TouchableOpacity>
            ))}

          {!selectedCountry && countries.length === 0 && (
            <Text style={styles.emptyText}>{t('no_data')}</Text>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary + '14',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 42, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
  buttonSection: { gap: 12, marginBottom: 32 },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 52, borderRadius: RADIUS.card, gap: 10,
  },
  primaryButton: { backgroundColor: COLORS.primary },
  primaryButtonText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  outlineButton: {
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
  },
  outlineButtonText: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  loginSection: { gap: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  input: {
    height: 50, backgroundColor: COLORS.surface, borderRadius: RADIUS.button,
    paddingHorizontal: 16, fontSize: 17, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sheetBg: { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.sheet, borderTopRightRadius: RADIUS.sheet },
  sheetHandle: { backgroundColor: COLORS.textTertiary, width: 40 },
  sheetContent: { padding: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 4 },
  backBtnText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  listItem: {
    paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  listItemText: { fontSize: 17, color: COLORS.textPrimary },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
});
