import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, ThumbsDown, Flag, Edit3, Trash2, Send } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAppStore } from '../../store/useAppStore';
import { useSheet } from '../SheetProvider';
import RoleBadge from '../RoleBadge';
import { COLORS, RADIUS, SHADOW, SPHERE_COLORS } from '../../utils/constants';
import type { Obj, Comm, AppUser } from '../../utils/types';

interface Props {
  obj: Obj | null;
}

export default function BSObject({ obj }: Props) {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const queryClient = useQueryClient();
  const { openCreate } = useSheet();
  const [commentText, setCommentText] = useState('');

  if (!obj) return null;

  const sphereColor = SPHERE_COLORS[obj.obj_sphere] || COLORS.primary;
  const isAuthor = user && obj.obj_author === user.user_id;
  const isAdmin = user && (user.user_role === 'admin' || user.user_role === 'superadmin');
  const canInteract = user && user.user_role !== 'guest';

  const { data: comments } = useQuery({
    queryKey: ['comments', obj.obj_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comm')
        .select('*')
        .eq('comm_obj', obj.obj_id)
        .order('comm_date', { ascending: false });
      if (error) throw error;
      return data as Comm[];
    },
  });

  const { data: author } = useQuery({
    queryKey: ['user', obj.obj_author],
    queryFn: async () => {
      if (!obj.obj_author) return null;
      const { data } = await supabase.from('user').select('*').eq('user_id', obj.obj_author).single();
      return data as AppUser | null;
    },
    enabled: !!obj.obj_author,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const likes = [...(obj.obj_likes || [])];
      const dislikes = (obj.obj_dislikes || []).filter((id) => id !== user.user_id);
      const idx = likes.indexOf(user.user_id);
      if (idx >= 0) likes.splice(idx, 1);
      else likes.push(user.user_id);
      await supabase.from('obj').update({ obj_likes: likes, obj_dislikes: dislikes }).eq('obj_id', obj.obj_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const dislikes = [...(obj.obj_dislikes || [])];
      const likes = (obj.obj_likes || []).filter((id) => id !== user.user_id);
      const idx = dislikes.indexOf(user.user_id);
      if (idx >= 0) dislikes.splice(idx, 1);
      else dislikes.push(user.user_id);
      await supabase.from('obj').update({ obj_dislikes: dislikes, obj_likes: likes }).eq('obj_id', obj.obj_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user || !commentText.trim()) return;
      await supabase.from('comm').insert({
        comm_obj: obj.obj_id,
        comm_author: user.user_id,
        comm_text: commentText.trim(),
        comm_date: new Date().toISOString(),
        comm_likes: [],
        comm_dislikes: [],
        comm_reports: [],
      });
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', obj.obj_id] });
    },
  });

  const deleteObj = useMutation({
    mutationFn: async () => {
      await supabase.from('obj').delete().eq('obj_id', obj.obj_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const handleDeleteObj = () => {
    Alert.alert(t('delete'), 'Are you sure?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteObj.mutate() },
    ]);
  };

  const handleReport = async () => {
    if (!user) return;
    const reports = obj.obj_reports || [];
    if (reports.includes(user.user_id)) return;
    await supabase.from('obj').update({ obj_reports: [...reports, user.user_id] }).eq('obj_id', obj.obj_id);
    Alert.alert('Reported');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={[styles.sphereBar, { backgroundColor: sphereColor }]} />
        {obj.obj_photo && <Image source={{ uri: obj.obj_photo }} style={styles.photo} />}
        <View style={styles.body}>
          <Text style={styles.title}>{obj.obj_title}</Text>
          <Text style={styles.date}>
            {obj.obj_date ? new Date(obj.obj_date).toLocaleDateString() : ''}
          </Text>
          {author && (
            <View style={styles.authorRow}>
              <Text style={styles.authorName}>{author.user_name}</Text>
              <RoleBadge role={author.user_role} />
            </View>
          )}
          {obj.obj_description ? <Text style={styles.desc}>{obj.obj_description}</Text> : null}

          <View style={styles.actionRow}>
            {canInteract && (
              <>
                <TouchableOpacity testID="like-btn" style={styles.actionBtn} onPress={() => likeMutation.mutate()}>
                  <ThumbsUp size={20} color={obj.obj_likes?.includes(user!.user_id) ? COLORS.primary : COLORS.textSecondary} strokeWidth={1.5} />
                  <Text style={styles.actionText}>{obj.obj_likes?.length || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="dislike-btn" style={styles.actionBtn} onPress={() => dislikeMutation.mutate()}>
                  <ThumbsDown size={20} color={obj.obj_dislikes?.includes(user!.user_id) ? COLORS.destructive : COLORS.textSecondary} strokeWidth={1.5} />
                  <Text style={styles.actionText}>{obj.obj_dislikes?.length || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="report-btn" style={styles.actionBtn} onPress={handleReport}>
                  <Flag size={20} color={COLORS.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
              </>
            )}
            {isAuthor && (
              <TouchableOpacity testID="edit-btn" style={styles.actionBtn} onPress={() => openCreate(obj)}>
                <Edit3 size={20} color={COLORS.primary} strokeWidth={1.5} />
              </TouchableOpacity>
            )}
            {(isAuthor || isAdmin) && (
              <TouchableOpacity testID="delete-btn" style={styles.actionBtn} onPress={handleDeleteObj}>
                <Trash2 size={20} color={COLORS.destructive} strokeWidth={1.5} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.commSection}>
            <Text style={styles.commTitle}>{t('comments')} ({comments?.length || 0})</Text>
            {canInteract && (
              <View style={styles.commInput}>
                <TextInput
                  testID="comment-input"
                  style={styles.commField}
                  placeholder={t('add_comment')}
                  placeholderTextColor={COLORS.textTertiary}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={400}
                />
                <TouchableOpacity testID="send-comment-btn" onPress={() => addComment.mutate()} disabled={!commentText.trim()}>
                  <Send size={22} color={commentText.trim() ? COLORS.primary : COLORS.textTertiary} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            )}
            {comments?.map((comm) => (
              <CommentItem key={comm.comm_id} comment={comm} userId={user?.user_id} isAdmin={!!isAdmin} />
            ))}
          </View>
        </View>
      </BottomSheetScrollView>
    </KeyboardAvoidingView>
  );
}

function CommentItem({ comment, userId, isAdmin }: { comment: Comm; userId?: string; isAdmin: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: cAuthor } = useQuery({
    queryKey: ['user', comment.comm_author],
    queryFn: async () => {
      const { data } = await supabase.from('user').select('*').eq('user_id', comment.comm_author).single();
      return data as AppUser | null;
    },
  });

  const handleDelete = async () => {
    await supabase.from('comm').delete().eq('comm_id', comment.comm_id);
    queryClient.invalidateQueries({ queryKey: ['comments'] });
  };

  const handleReport = async () => {
    if (!userId) return;
    const reports = comment.comm_reports || [];
    if (reports.includes(userId)) return;
    await supabase.from('comm').update({ comm_reports: [...reports, userId] }).eq('comm_id', comment.comm_id);
  };

  const isCommAuthor = userId === comment.comm_author;

  return (
    <View style={cStyles.item}>
      <View style={cStyles.row}>
        <Text style={cStyles.name}>{cAuthor?.user_name || 'User'}</Text>
        {cAuthor && <RoleBadge role={cAuthor.user_role} />}
        <Text style={cStyles.date}>{new Date(comment.comm_date).toLocaleDateString()}</Text>
      </View>
      <Text style={cStyles.text}>{comment.comm_text}</Text>
      <View style={cStyles.actions}>
        {(isCommAuthor || isAdmin) && (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={cStyles.deleteText}>{t('delete')}</Text>
          </TouchableOpacity>
        )}
        {userId && !isCommAuthor && (
          <TouchableOpacity onPress={handleReport}>
            <Text style={cStyles.reportText}>{t('report')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  sphereBar: { height: 4, borderRadius: 2 },
  photo: { width: '100%', height: 200 },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  date: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  desc: { fontSize: 16, color: COLORS.textPrimary, lineHeight: 24, marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 16, marginBottom: 24, paddingTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 15, color: COLORS.textSecondary },
  commSection: { marginTop: 8 },
  commTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  commInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.background, borderRadius: RADIUS.card, padding: 12, marginBottom: 16,
  },
  commField: { flex: 1, fontSize: 15, color: COLORS.textPrimary, maxHeight: 80 },
});

const cStyles = StyleSheet.create({
  item: {
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  name: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  date: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 'auto' },
  text: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 6 },
  deleteText: { fontSize: 13, color: COLORS.destructive, fontWeight: '600' },
  reportText: { fontSize: 13, color: COLORS.textSecondary },
});
