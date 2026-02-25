import { useAppStore } from '../src/store/useAppStore';
import StartScreen from '../src/components/StartScreen';
import Glagne from '../src/components/Glagne';

export default function Index() {
  const currentMunId = useAppStore((s) => s.currentMunId);
  return currentMunId ? <Glagne /> : <StartScreen />;
}
