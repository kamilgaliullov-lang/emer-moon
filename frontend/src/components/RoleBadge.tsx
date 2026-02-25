import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import type { UserRole } from '../utils/types';

interface Props {
  role: UserRole;
}

export default function RoleBadge({ role }: Props) {
  if (role !== 'activist' && role !== 'admin' && role !== 'superadmin') return null;

  const label = role === 'activist' ? 'Activist' : role === 'admin' ? 'Mayor' : 'SuperAdmin';
  const color =
    role === 'activist'
      ? COLORS.warning
      : role === 'admin'
        ? COLORS.primary
        : COLORS.destructive;

  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]} testID={`role-badge-${role}`}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
