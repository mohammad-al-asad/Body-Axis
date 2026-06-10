import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';

interface MilestoneCard {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  badgeColor: string;
}

interface AchievementItem {
  id: string;
  title: string;
  icon: string;
  iconType: 'feather' | 'material';
  color: string;
  glowColor: string;
  locked: boolean;
}

const MILESTONES_DATA: MilestoneCard[] = [
  {
    id: '1',
    badge: 'UNLOCKS AT 15 DAYS',
    title: 'Core Stability Unlock',
    subtitle: 'Targeting deep transverse abdominis control.',
    badgeColor: '#C084FC',
  },
  {
    id: '2',
    badge: 'NEXT LEVEL',
    title: 'Advanced Mobility Intro',
    subtitle: 'Proprioceptive calibration & athletic agility.',
    badgeColor: '#44E2CD',
  },
];

const ACHIEVEMENTS_DATA: AchievementItem[] = [
  {
    id: '1',
    title: 'Early Bird',
    icon: 'award',
    iconType: 'feather',
    color: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.15)',
    locked: false,
  },
  {
    id: '2',
    title: '7-Day Streak',
    icon: 'fire',
    iconType: 'material',
    color: '#44E2CD',
    glowColor: 'rgba(68, 226, 205, 0.15)',
    locked: false,
  },
  {
    id: '3',
    title: 'Legend',
    icon: 'lock',
    iconType: 'feather',
    color: '#475569',
    glowColor: 'transparent',
    locked: true,
  },
];

export default function ProgressScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // SVG parameters for Recovery circle (88%)
  const circleSize = 64;
  const strokeWidth = 4;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const recoveryPercentage = 88;
  const strokeDashoffset = circumference - (recoveryPercentage / 100) * circumference;

  const handleAchievementPress = (item: AchievementItem) => {
    if (item.locked) {
      Alert.alert('Locked Achievement', `Keep training to unlock the "${item.title}" badge!`);
    } else {
      Alert.alert('Unlocked Milestone!', `Congratulations! You unlocked the "${item.title}" achievement.`);
    }
  };

  const handleToggleAchievements = () => {
    setShowAllAchievements((prev) => !prev);
    Alert.alert('Achievements', 'You have unlocked 3 out of 12 global training milestones!');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Unified Header */}
        <Header />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Key Stats Grid Card */}
          <View style={styles.dashboardCard}>
            <View style={styles.dashboardRow}>
              {/* Sessions count */}
              <View style={styles.statBox}>
                <Text style={styles.dashboardLabel}>Sessions</Text>
                <View style={styles.sessionsValueRow}>
                  <Text style={styles.sessionsNumber}>18</Text>
                  <Text style={styles.sessionsSubText}>total</Text>
                </View>
              </View>

              {/* Recovery SVG circle */}
              <View style={styles.recoveryBox}>
                <Text style={styles.dashboardLabelRight}>Recovery</Text>
                <View style={styles.circleWrapper}>
                  <Svg width={circleSize} height={circleSize} style={styles.svgCircle}>
                    {/* Background Circle */}
                    <Circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      stroke={theme.inputBorder}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    {/* Active Progress Circle */}
                    <Circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      stroke={theme.secondary}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </Svg>
                  {/* Center Text */}
                  <View style={styles.circleTextCenter}>
                    <Text style={styles.recoveryValue}>88</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Row: Improvement & Current Streak */}
            <View style={styles.dashboardBottomRow}>
              <View style={styles.bottomStatBox}>
                <Text style={styles.dashboardLabel}>Improvement</Text>
                <View style={styles.trendingRow}>
                  <Feather name="trending-up" size={15} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={styles.improvementValue}>+24%</Text>
                </View>
              </View>

              <View style={styles.bottomStatBoxRight}>
                <Text style={styles.dashboardLabelRight}>Current Streak</Text>
                <Text style={styles.streakValue}>12 <Text style={styles.streakLabel}>Days</Text></Text>
              </View>
            </View>
          </View>

          {/* Active Program Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Program</Text>
          </View>

          <View style={styles.activeProgramCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80' }}
              style={styles.programImage}
            />
            {/* Dark gradient shadow overlay */}
            <View style={styles.programOverlay} />

            {/* Content overlay container */}
            <View style={styles.programContentContainer}>
              <View style={styles.programBadgesRow}>
                <View style={styles.programBadge}>
                  <Text style={styles.programBadgeText}>WEEK 3 OF 4</Text>
                </View>
              </View>

              <View style={styles.programTitleProgressRow}>
                <Text style={styles.programTitle}>Hip Mobility Reset</Text>
                <Text style={styles.programProgressPercent}>72%</Text>
              </View>

              {/* Custom Track Bar */}
              <View style={styles.trackBarTrack}>
                <View style={[styles.trackBarFill, { width: '72%' }]} />
              </View>
            </View>
          </View>

          {/* Weekly Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
          </View>

          <View style={styles.weeklyActivityCard}>
            <Text style={styles.weeklyActivitySubtitle}>3 out of 4 sessions completed</Text>
            {/* Pill progress bar */}
            <View style={styles.weeklyActivityTrack}>
              <View style={[styles.weeklyActivityFill, { width: '75%' }]} />
            </View>

            {/* Days letters row */}
            <View style={styles.daysRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const isCompleted = idx < 3;
                return (
                  <Text
                    key={idx}
                    style={[
                      styles.dayLetter,
                      isCompleted ? styles.dayLetterCompleted : styles.dayLetterIncomplete,
                    ]}
                  >
                    {day}
                  </Text>
                );
              })}
            </View>
          </View>

          {/* Upcoming Milestones */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Milestones</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.milestonesScrollContent}
          >
            {MILESTONES_DATA.map((card) => (
              <View key={card.id} style={styles.milestoneCard}>
                <Text style={[styles.milestoneBadgeText, { color: card.badgeColor }]}>
                  {card.badge}
                </Text>
                <Text style={styles.milestoneTitle}>{card.title}</Text>
                <Text style={styles.milestoneSubtitle}>{card.subtitle}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Achievements */}
          <View style={styles.sectionHeaderViewAll}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={() => Alert.alert('Achievements', 'You have unlocked 2 out of 3 badges!')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScrollContent}
          >
            {ACHIEVEMENTS_DATA.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.achievementCircleCard}
                activeOpacity={0.8}
                onPress={() => handleAchievementPress(item)}
              >
                <View
                  style={[
                    styles.achievementOuterRing,
                    { borderColor: item.color },
                    !item.locked && { backgroundColor: item.glowColor },
                  ]}
                >
                  {item.iconType === 'material' ? (
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.locked ? '#475569' : item.color} />
                  ) : (
                    <Feather name={item.icon as any} size={18} color={item.locked ? '#475569' : item.color} />
                  )}
                </View>
                <Text style={styles.achievementTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Motivational Bottom Quote */}
          <View style={styles.quoteCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80' }}
              style={styles.quoteImage}
            />
            {/* Quotation mark overlay */}
            <View style={styles.quoteOverlay} />
            <View style={styles.quoteContent}>
              <Text style={styles.quoteQuoteMark}>”</Text>
              <Text style={styles.quoteText}>
                You're building healthier movement habits every week. Keep it up!
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    dashboardCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      marginHorizontal: 24,
      padding: 24,
    marginTop: 24,
      marginBottom: 28,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    dashboardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.inputBorder,
      paddingBottom: 20,
    },
    statBox: {
      flex: 1,
    },
    dashboardLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 6,
    },
    dashboardLabelRight: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 6,
      textAlign: 'right',
    },
    sessionsValueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    sessionsNumber: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.text,
      marginRight: 6,
      letterSpacing: -1,
    },
    sessionsSubText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    recoveryBox: {
      alignItems: 'flex-end',
    },
    circleWrapper: {
      width: 64,
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      marginTop: 4,
    },
    svgCircle: {
      transform: [{ rotate: '-90deg' }],
    },
    circleTextCenter: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
    recoveryValue: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    dashboardBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 20,
    },
    bottomStatBox: {
      flex: 1,
    },
    bottomStatBoxRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    trendingRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    improvementValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#10B981',
    },
    streakValue: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
    },
    streakLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    sectionHeader: {
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    sectionHeaderViewAll: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.3,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.secondary,
    },
    activeProgramCard: {
      marginHorizontal: 24,
      height: 180,
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: 28,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    programImage: {
      width: '100%',
      height: '100%',
    },
    programOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(5, 11, 20, 0.45)',
    },
    programContentContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
    },
    programBadgesRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    programBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
    },
    programBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    programTitleProgressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 10,
    },
    programTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
    programProgressPercent: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.secondary,
    },
    trackBarTrack: {
      height: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    trackBarFill: {
      height: '100%',
      backgroundColor: theme.secondary,
      borderRadius: 3,
    },
    weeklyActivityCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      marginHorizontal: 24,
      padding: 24,
      marginBottom: 28,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    weeklyActivitySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '600',
      marginBottom: 16,
    },
    weeklyActivityTrack: {
      height: 8,
      backgroundColor: theme.inputBackground,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 16,
    },
    weeklyActivityFill: {
      height: '100%',
      backgroundColor: theme.secondary,
      borderRadius: 4,
    },
    daysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
    },
    dayLetter: {
      fontSize: 12,
      fontWeight: '700',
    },
    dayLetterCompleted: {
      color: theme.secondary,
    },
    dayLetterIncomplete: {
      color: theme.textSecondary,
    },
    milestonesScrollContent: {
      paddingLeft: 24,
      paddingRight: 12,
      marginBottom: 28,
    },
    milestoneCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 20,
      marginRight: 14,
      width: 240,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    milestoneBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    milestoneTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      letterSpacing: -0.2,
    },
    milestoneSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '500',
      lineHeight: 18,
    },
    achievementsScrollContent: {
      paddingLeft: 24,
      paddingRight: 12,
      marginBottom: 28,
    },
    achievementCircleCard: {
      alignItems: 'center',
      marginRight: 18,
      width: 78,
    },
    achievementOuterRing: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    achievementTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
      lineHeight: 14,
    },
    quoteCard: {
      marginHorizontal: 24,
      height: 120,
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1,
      borderColor: theme.cardBorder,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    quoteImage: {
      width: '100%',
      height: '100%',
    },
    quoteOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(5, 11, 20, 0.45)',
    },
    quoteContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    quoteQuoteMark: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'rgba(255, 255, 255, 0.4)',
      lineHeight: 20,
      marginBottom: 2,
    },
    quoteText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      lineHeight: 18,
    },
  });
