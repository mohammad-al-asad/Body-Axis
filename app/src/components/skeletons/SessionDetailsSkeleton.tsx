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

export function SessionDetailsSkeleton() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View>
      <View style={styles.titleContainer}>
        <SkeletonBlock width="82%" height={32} borderRadius={8} />
        <SkeletonBlock width="94%" height={14} borderRadius={7} style={styles.subtitleLine} />
        <SkeletonBlock width="68%" height={14} borderRadius={7} style={styles.subtitleLineSmall} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <SkeletonBlock width="62%" height={26} borderRadius={8} />
          <SkeletonBlock width={64} height={26} borderRadius={6} />
        </View>

        <SkeletonBlock width="48%" height={14} borderRadius={7} style={styles.sectionTitle} />
        <View style={styles.equipmentGrid}>
          <SkeletonBlock width="48%" height={90} borderRadius={16} />
          <SkeletonBlock width="48%" height={90} borderRadius={16} />
        </View>

        <SkeletonBlock width="36%" height={14} borderRadius={7} style={styles.metaLine} />

        <View style={styles.phaseList}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.phaseRow}>
              <SkeletonBlock width={2} height={42} borderRadius={1} />
              <View style={styles.phaseContent}>
                <SkeletonBlock width="46%" height={12} borderRadius={6} />
                <SkeletonBlock width="78%" height={16} borderRadius={8} style={styles.exerciseLine} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.progressRow}>
          <SkeletonBlock width="44%" height={12} borderRadius={6} />
          <SkeletonBlock width={34} height={12} borderRadius={6} />
        </View>
        <SkeletonBlock width="100%" height={6} borderRadius={3} />

        <View style={styles.actionsRow}>
          <SkeletonBlock width="44%" height={48} borderRadius={14} />
          <SkeletonBlock width="52%" height={48} borderRadius={14} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    titleContainer: {
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    subtitleLine: {
      marginTop: 16,
    },
    subtitleLineSmall: {
      marginTop: 8,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 24,
      marginBottom: 20,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    sectionTitle: {
      marginBottom: 12,
    },
    equipmentGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    metaLine: {
      marginBottom: 18,
    },
    phaseList: {
      borderTopWidth: 1,
      borderTopColor: theme.inputBorder,
      paddingTop: 16,
      marginBottom: 20,
      gap: 16,
    },
    phaseRow: {
      flexDirection: 'row',
    },
    phaseContent: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
    },
    exerciseLine: {
      marginTop: 8,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
  });
