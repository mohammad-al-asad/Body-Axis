import { Image } from 'expo-image';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeState } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { SessionCard } from '@/components/SessionCard';

export function HomeDashboard() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      
      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back, Christina.</Text>
      </View>

      {/* Current Session Card */}
      <SessionCard
        session={{
          title: 'Hip Mobility + Core Stability',
          label: 'CURRENT MOVEMENT SESSION',
          phase: 'Week 01',
          schedule: 'Repeat 3x',
          progressPercent: 33,
          progressLabel: 'Plans 1 of 3',
          isActive: true,
        }}
        startButtonText="Start Today's Session"
        onStartPress={() => router.push('/sessions/session-details')}
        onCreateNewPress={() => router.push('/intake')}
      />

      {/* Row: Weekly Progress & Focus Areas */}
      <View style={styles.statsRow}>
        {/* Weekly Progress Card */}
        <View style={styles.halfCard}>
          <Text style={styles.statLabel}>WEEKLY PROGRESS</Text>
          <View style={styles.indicatorsContainer}>
            <View style={styles.indicatorCompleted}>
              <Feather name="check" size={10} color="#050B14" />
            </View>
            <View style={styles.indicatorInProgress}>
              <View style={styles.indicatorInProgressDot} />
            </View>
            <View style={styles.indicatorEmpty} />
            <View style={styles.indicatorEmpty} />
          </View>
          <Text style={styles.statValue}>1 Completed</Text>
          <Text style={styles.statSubtext}>2 Remaining</Text>
        </View>

        {/* Focus Areas Card */}
        <View style={styles.halfCard}>
          <Text style={styles.statLabel}>FOCUS AREAS</Text>
          <View style={styles.focusList}>
            <View style={styles.focusItem}>
              <Image
                source={require('@/assets/images/icons/hips.png')}
                style={styles.focusIcon}
              />
              <Text style={styles.focusText}>Hips</Text>
            </View>
            <View style={styles.focusItem}>
              <Image
                source={require('@/assets/images/icons/lowerBack.png')}
                style={styles.focusIcon}
              />
              <Text style={styles.focusText}>Lower Back</Text>
            </View>
            <View style={styles.focusItem}>
              <Image
                source={require('@/assets/images/icons/glutes.png')}
                style={styles.focusIcon}
              />
              <Text style={styles.focusText}>Glutes</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Row: Streak & Plan Goal */}
      <View style={styles.statsRow}>
        {/* Streak Card */}
        <View style={[styles.halfCard, styles.streakCard]}>
          <Ionicons name="flame" size={30} color="#DEB7FF" style={{ marginBottom: 6 }} />
          <Text style={[styles.statLabel, { marginBottom: 5 }]}>STREAK</Text>
          <Text style={[styles.streakValue, { marginBottom: 2 }]}>7 Days</Text>
          <Text style={styles.streakSubtext}>IN A ROW</Text>
        </View>

        {/* Plan Goal Card */}
        <View style={styles.halfCard}>
          <Text style={styles.statLabel}>PLAN GOAL</Text>
          <Text style={styles.goalTitle}>Move with more control</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: theme.secondary }]} />
              <Text style={styles.bulletItem}>Build hip stability</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: theme.secondary }]} />
              <Text style={styles.bulletItem}>Lower-back support</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: theme.secondary }]} />
              <Text style={styles.bulletItem}>Glute strength</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Try This Next Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Try This Next</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAllLink}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Supplemental Exercise Row Card */}
      <TouchableOpacity style={styles.supplementalCard} activeOpacity={0.9}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=150&q=80' }}
          style={styles.supplementalImage}
        />
        <View style={styles.supplementalContent}>
          <Text style={styles.supplementalLabel}>SUPPLEMENTAL</Text>
          <Text style={styles.supplementalTitle}>Glute Stability + Lower Back Support</Text>
          <View style={styles.supplementalMeta}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>12 min</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="zap" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>Level 2</Text>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} style={styles.chevronIcon} />
      </TouchableOpacity>

      {/* Explore Movement Plans Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore Movement Sessions</Text>
        <TouchableOpacity onPress={()=>router.push("/sessions")}>
          <Text style={styles.viewAllLink}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Explore Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}>
        
        {/* Card A */}
        <TouchableOpacity style={styles.exploreCard} activeOpacity={0.9}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80' }}
            style={styles.exploreImage}
          />
          <Text style={styles.exploreTitle}>Post-Run Recovery</Text>
        </TouchableOpacity>

        {/* Card B */}
        <TouchableOpacity style={styles.exploreCard} activeOpacity={0.9}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80' }}
            style={styles.exploreImage}
          />
          <Text style={styles.exploreTitle}>Upper Body Flex</Text>
        </TouchableOpacity>
      </ScrollView>

    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  halfCard: {
    flex: 1,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    minHeight: 124,
  },
  streakCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  indicatorCompleted: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInProgress: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInProgressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.secondary,
  },
  indicatorEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.inputBorder,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  statSubtext: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  focusList: {
    gap: 8,
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusText: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '500',
  },
  focusIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
  },
  streakSubtext: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DEB7FF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  bulletList: {
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 8,
  },
  bulletItem: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  viewAllLink: {
    color: theme.secondary,
    fontSize: 13,
    fontWeight: '700',
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
  supplementalImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  supplementalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  supplementalLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  supplementalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 6,
  },
  supplementalMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  horizontalScrollContent: {
    paddingRight: 24,
    marginBottom: 24,
  },
  exploreCard: {
    width: 156,
    marginRight: 16,
  },
  exploreImage: {
    width: '100%',
    height: 104,
    borderRadius: 16,
    marginBottom: 8,
  },
  exploreTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },
  seeMoreCard: {
    width: 120,
    height: 104,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.inputBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeState === 'dark' ? '#0F1824' : '#F0F0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeMoreText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
  },
});
