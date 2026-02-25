import { useEffect } from 'react';
import { useAppStore } from '../src/store/useAppStore';
import StartScreen from '../src/components/StartScreen';
import Glagne from '../src/components/Glagne';

export default function Index() {
  const currentMunId = useAppStore((s) => s.currentMunId);
  const currentMun = useAppStore((s) => s.currentMun);
  
  useEffect(() => {
    console.log('Index: currentMunId changed to:', currentMunId);
    console.log('Index: currentMun:', currentMun?.mun_name);
  }, [currentMunId, currentMun]);
  
  console.log('Index render: currentMunId =', currentMunId);
  
  return currentMunId ? <Glagne /> : <StartScreen />;
}
