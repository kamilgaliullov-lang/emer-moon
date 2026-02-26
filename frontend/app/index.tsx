import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppStore } from '../src/store/useAppStore';
import StartScreen from '../src/components/StartScreen';
import Glagne from '../src/components/Glagne';
import { COLORS } from '../src/utils/constants';

export default function Index() {
  const currentMunId = useAppStore((s) => s.currentMunId);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  
  // Show loading while hydrating from storage
  if (!hasHydrated) {
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
