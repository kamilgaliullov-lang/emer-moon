import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Cloud, Sun, CloudRain, Snowflake, Wind, CloudDrizzle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../services/api';
import { COLORS, RADIUS, SHADOW } from '../utils/constants';

interface Props {
  coordinates?: { lat: number; lng: number } | null;
}

const getWeatherIcon = (main: string) => {
  switch (main?.toLowerCase()) {
    case 'clear':
      return Sun;
    case 'rain':
      return CloudRain;
    case 'drizzle':
      return CloudDrizzle;
    case 'snow':
      return Snowflake;
    default:
      return Cloud;
  }
};

export default function WeatherWidget({ coordinates }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['weather', coordinates?.lat, coordinates?.lng],
    queryFn: () => fetchWeather(coordinates!.lat, coordinates!.lng),
    enabled: !!coordinates?.lat && !!coordinates?.lng,
    staleTime: 1000 * 60 * 30,
  });

  if (!coordinates) return null;

  const temp = data?.main?.temp != null ? Math.round(data.main.temp) : '--';
  const desc = data?.weather?.[0]?.description || '';
  const weatherMain = data?.weather?.[0]?.main || 'Clouds';
  const WeatherIcon = getWeatherIcon(weatherMain);

  return (
    <View style={styles.container} testID="weather-widget">
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <>
          <View style={styles.iconWrap}>
            <WeatherIcon size={36} color={COLORS.primary} strokeWidth={1.5} />
          </View>
          <View style={styles.info}>
            <Text style={styles.temp}>{temp}°C</Text>
            <Text style={styles.desc}>{desc}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 20,
    ...SHADOW.soft,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  temp: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  desc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
});
