import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Send, Lock } from 'lucide-react-native';
import { sendChatMessage } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, RADIUS } from '../../utils/constants';
import { supabase } from '../../services/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export default function BSChat() {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');

  const { data: startMsg } = useQuery({
    queryKey: ['config', 'start_message'],
    queryFn: async () => {
      const { data } = await supabase.from('config').select('*').eq('config_key', 'start_message').single();
      return data?.config_value || 'Hello! I am your municipal AI assistant. How can I help you today?';
    },
  });

  const isPremium = user?.user_premium === true;

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await sendChatMessage(input.trim(), conversationId, user?.user_id || 'anonymous');
      if (resp.conversation_id) setConversationId(resp.conversation_id);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: resp.answer || resp.error || 'No response',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: 'Connection error' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.header}>{t('ai_assistant')}</Text>

        <View style={styles.chatArea}>
          {startMsg && messages.length === 0 && (
            <View style={styles.startMsgWrap}>
              <Text style={styles.startMsg}>{startMsg}</Text>
            </View>
          )}
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>{item.text}</Text>
              </View>
            )}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
          {loading && <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 8 }} />}
        </View>

        {!isPremium ? (
          <View style={styles.lockedBar}>
            <Lock size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
            <Text style={styles.lockedText}>{t('premium_required')}</Text>
          </View>
        ) : (
          <View style={styles.inputBar}>
            <TextInput
              testID="chat-input"
              style={styles.chatInput}
              value={input}
              onChangeText={setInput}
              placeholder={t('type_message')}
              placeholderTextColor={COLORS.textTertiary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity testID="chat-send-btn" onPress={handleSend} disabled={!input.trim()}>
              <Send size={22} color={input.trim() ? COLORS.primary : COLORS.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, padding: 20, paddingBottom: 12 },
  chatArea: { flex: 1, paddingHorizontal: 16 },
  startMsgWrap: { backgroundColor: COLORS.background, borderRadius: RADIUS.card, padding: 16, marginBottom: 12 },
  startMsg: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  messageList: { paddingBottom: 12 },
  bubble: { maxWidth: '80%', borderRadius: 18, padding: 12, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.background },
  bubbleText: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 22 },
  userBubbleText: { color: '#FFF' },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chatInput: { flex: 1, fontSize: 16, color: COLORS.textPrimary, maxHeight: 80 },
  lockedBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border,
  },
  lockedText: { fontSize: 14, color: COLORS.textSecondary },
});
