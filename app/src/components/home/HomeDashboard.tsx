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

      {/* Current Movement Plan Card */}
      <View style={styles.currentPlanCard}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.currentPlanLabel}>CURRENT MOVEMENT PLAN</Text>
            <Text style={styles.currentPlanTitle}>Hip Mobility + Core Stability</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        </View>

        {/* Phase & Schedule Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>PHASE</Text>
            <Text style={styles.infoValue}>Week 01</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>SCHEDULE</Text>
            <Text style={styles.infoValue}>Repeat 3x</Text>
          </View>
        </View>

        {/* Progress Tracker Bar */}
        <View style={styles.progressTextRow}>
          <Text style={styles.progressTextLeft}>Plans 1 of 3</Text>
          <Text style={styles.progressTextRight}>33%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarFill} />
        </View>

        {/* Start Today's Session Button */}
        <TouchableOpacity style={styles.startSessionButton} activeOpacity={0.9} onPress={()=>router.push("/sessions/session-details")}>
          <Feather name="play" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.startSessionButtonText}>Start Today's Session</Text>
        </TouchableOpacity>

        {/* Start New Plan Link */}
        <TouchableOpacity onPress={()=>router.push("/intake")} style={styles.startNewPlanLink} activeOpacity={0.7}>
          <Text style={styles.startNewPlanLinkText}>+ Create New Session</Text>
        </TouchableOpacity>
      </View>

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
        <TouchableOpacity onPress={()=>router.push("/sessions/index")}>
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
  currentPlanCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  currentPlanLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.secondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  currentPlanTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    lineHeight: 26,
    marginTop:10
  },
  activeBadge: {
    backgroundColor: 'rgba(93, 230, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(93, 230, 255, 0.25)',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.secondary,
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 32,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTextLeft: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  progressTextRight: {
    fontSize: 12,
    color: theme.secondary,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: themeState === 'dark' ? '#141E30' : '#E0E1E6',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.secondary,
    width: '33%',
    borderRadius: 3,
  },
  startSessionButton: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  startSessionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  startNewPlanLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startNewPlanLinkText: {
    color: theme.secondary,
    fontSize: 13,
    fontWeight: '700',
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
