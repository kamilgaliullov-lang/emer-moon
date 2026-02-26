import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppStore } from '../src/store/useAppStore';
import StartScreen from '../src/components/StartScreen';
import Glagne from '../src/components/Glagne';
import { COLORS } from '../src/utils/constants';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const currentMunId = useAppStore((s) => s.currentMunId);
  
  useEffect(() => {
    // Small delay to allow zustand to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading while hydrating from storage
  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  return currentMunId ? <Glagne /> : <StartScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
