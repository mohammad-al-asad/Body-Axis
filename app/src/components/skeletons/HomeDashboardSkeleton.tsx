import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

function SkeletonBlock({
  width,
  height,
  borderRadius = 10,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          opacity,
          backgroundColor: theme.backgroundSelected,
        },
        style,
      ]}
    />
  );
}

export function HomeDashboardSkeleton() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View>
      <View style={styles.sessionCard}>
        <SkeletonBlock width="52%" height={12} borderRadius={6} style={styles.labelLine} />
        <View style={styles.sessionHeader}>
          <SkeletonBlock width="66%" height={26} borderRadius={8} />
          <SkeletonBlock width={64} height={26} borderRadius={6} />
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <SkeletonBlock width="36%" height={10} borderRadius={5} />
            <SkeletonBlock width="68%" height={16} borderRadius={8} style={styles.valueLine} />
          </View>
          <View style={styles.infoColumn}>
            <SkeletonBlock width="44%" height={10} borderRadius={5} />
            <SkeletonBlock width="62%" height={16} borderRadius={8} style={styles.valueLine} />
          </View>
        </View>
        <View style={styles.progressRow}>
          <SkeletonBlock width="48%" height={12} borderRadius={6} />
          <SkeletonBlock width={34} height={12} borderRadius={6} />
        </View>
        <SkeletonBlock width="100%" height={6} borderRadius={3} />
        <SkeletonBlock width="100%" height={54} borderRadius={14} style={styles.buttonLine} />
      </View>

      <View style={styles.statsRow}>
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </View>
      <View style={styles.statsRow}>
        <StatsCardSkeleton centered />
        <StatsCardSkeleton />
      </View>

      <View style={styles.sectionHeader}>
        <SkeletonBlock width="44%" height={20} borderRadius={8} />
      </View>
      <View style={styles.supplementalCard}>
        <SkeletonBlock width={64} height={64} borderRadius={12} />
        <View style={styles.supplementalContent}>
          <SkeletonBlock width="34%" height={10} borderRadius={5} />
          <SkeletonBlock width="76%" height={16} borderRadius={8} style={styles.valueLine} />
          <SkeletonBlock width="52%" height={12} borderRadius={6} style={styles.valueLine} />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <SkeletonBlock width="58%" height={20} borderRadius={8} />
        <SkeletonBlock width={54} height={14} borderRadius={7} />
      </View>
      <ExploreSessionsSkeleton />
    </View>
  );
}

export function ExploreSessionsSkeleton() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.exploreRow}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.exploreCard}>
          <SkeletonBlock width="100%" height={104} borderRadius={16} />
          <SkeletonBlock width="84%" height={14} borderRadius={7} style={styles.exploreTitle} />
          <SkeletonBlock width="62%" height={12} borderRadius={6} style={styles.valueLine} />
        </View>
      ))}
    </View>
  );
}

function StatsCardSkeleton({ centered = false }: { centered?: boolean }) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.halfCard, centered && styles.centeredCard]}>
      <SkeletonBlock width={centered ? 42 : '54%'} height={12} borderRadius={6} />
      <SkeletonBlock width={centered ? 72 : '86%'} height={20} borderRadius={8} style={styles.statMainLine} />
      <SkeletonBlock width={centered ? 56 : '62%'} height={12} borderRadius={6} style={styles.valueLine} />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    sessionCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 24,
      marginBottom: 20,
    },
    labelLine: {
      marginBottom: 12,
    },
    sessionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    infoGrid: {
      flexDirection: 'row',
      gap: 32,
      marginBottom: 24,
    },
    infoColumn: {
      flex: 1,
    },
    valueLine: {
      marginTop: 8,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    buttonLine: {
      marginTop: 24,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    halfCard: {
      flex: 1,
      minHeight: 124,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 16,
    },
    centeredCard: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    statMainLine: {
      marginTop: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 16,
    },
    supplementalCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    supplementalContent: {
      flex: 1,
      justifyContent: 'center',
      marginLeft: 16,
    },
    exploreRow: {
      flexDirection: 'row',
      paddingRight: 24,
      marginBottom: 24,
      overflow: 'hidden',
    },
    exploreCard: {
      width: 156,
      marginRight: 16,
    },
    exploreTitle: {
      marginTop: 8,
    },
  });
