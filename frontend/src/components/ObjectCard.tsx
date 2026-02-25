import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SPHERE_COLORS } from '../utils/constants';
import type { Obj } from '../utils/types';

interface Props {
  obj: Obj;
  onPress?: () => void;
}

export default function ObjectCard({ obj, onPress }: Props) {
  const sphereColor = SPHERE_COLORS[obj.obj_sphere] || COLORS.primary;
  const date = obj.obj_date ? new Date(obj.obj_date).toLocaleDateString() : '';

  return (
    <TouchableOpacity
      testID={`obj-card-${obj.obj_id}`}
      style={[styles.card, { borderLeftColor: sphereColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {obj.obj_photo ? (
        <Image source={{ uri: obj.obj_photo }} style={styles.photo} />
      ) : (
        <View
          style={[styles.photo, styles.photoPlaceholder, { backgroundColor: sphereColor + '20' }]}
        >
          <Text style={[styles.placeholderIcon, { color: sphereColor }]}>
            {obj.obj_type?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {obj.obj_title}
        </Text>
        <Text style={styles.date}>{date}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <ThumbsUp size={14} color={COLORS.textSecondary} strokeWidth={1.5} />
            <Text style={styles.metaText}>{obj.obj_likes?.length || 0}</Text>
          </View>
          <View style={styles.metaItem}>
            <ThumbsDown size={14} color={COLORS.textSecondary} strokeWidth={1.5} />
            <Text style={styles.metaText}>{obj.obj_dislikes?.length || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderLeftWidth: 4,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOW.soft,
  },
  photo: {
    width: 88,
    height: 88,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
