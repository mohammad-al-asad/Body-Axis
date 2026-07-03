import { Image } from 'expo-image';
import React from 'react';
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
import { useGetProgressSummaryQuery } from '@/redux/api/sessionApi';

interface NextStepCard {
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

const getCurrentWeekDates = () => {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, idx) => {
    const value = new Date(monday);
    value.setDate(monday.getDate() + idx);
    return {
      key: value.toLocaleDateString('en-CA'),
      label: value.toLocaleDateString('en-US', { weekday: 'narrow' }),
    };
  });
};

export default function ProgressScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { data: summary } = useGetProgressSummaryQuery();

  // SVG parameters for Recovery circle (88%)
  const circleSize = 64;
  const strokeWidth = 4;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const recoveryPercentage = summary?.weekly_target_count
    ? Math.min(Math.round((summary.weekly_completed_count / summary.weekly_target_count) * 100), 100)
    : 0;
  const strokeDashoffset = circumference - (recoveryPercentage / 100) * circumference;
  const activeSession = summary?.active_session ?? null;
  const activePlan =
    activeSession?.plans.find((plan) => plan.plan_id === activeSession.next_exercise?.plan_id) ??
    activeSession?.plans.find((plan) => plan.progress_status !== 'completed') ??
    null;
  const weekDates = getCurrentWeekDates();
  const nextSteps: NextStepCard[] = activeSession?.next_exercise
    ? [
        {
          id: '1',
          badge: "TODAY'S FOCUS",
          title: activeSession.next_exercise.exercise_name,
          subtitle: `Continue ${activeSession.next_exercise.plan_name} in the ${activeSession.next_exercise.phase} phase.`,
          badgeColor: '#C084FC',
        },
      ]
    : [
        {
          id: '1',
          badge: 'NEXT FOCUS',
          title: 'Create or resume a session',
          subtitle: 'Your next movement suggestion will appear here once a session is active.',
          badgeColor: '#44E2CD',
        },
      ];
  const achievements: AchievementItem[] = (summary?.wins ?? []).map((win, index) => ({
    id: `${index + 1}`,
    title: win.title,
    icon: win.key.includes('streak') ? 'fire' : win.unlocked ? 'award' : 'lock',
    iconType: win.key.includes('streak') ? 'material' : 'feather',
    color: win.unlocked ? (index % 2 === 0 ? '#C084FC' : '#44E2CD') : '#475569',
    glowColor: win.unlocked
      ? index % 2 === 0
        ? 'rgba(192, 132, 252, 0.15)'
        : 'rgba(68, 226, 205, 0.25)'
      : 'transparent',
    locked: !win.unlocked,
  }));

  const handleAchievementPress = (item: AchievementItem) => {
    if (item.locked) {
      Alert.alert('Locked Achievement', `Keep training to unlock the "${item.title}" badge!`);
    } else {
      Alert.alert('Unlocked Milestone!', `Congratulations! You unlocked the "${item.title}" achievement.`);
    }
  };

  const handleToggleAchievements = () => {
    Alert.alert('Achievements', `You have unlocked ${achievements.filter((item) => !item.locked).length} wins so far.`);
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
                <Text style={styles.dashboardLabel}>Sessions Completed</Text>
                <View style={styles.sessionsValueRow}>
                  <Text style={styles.sessionsNumber}>{summary?.sessions_completed_total ?? 0}</Text>
                  <Text style={styles.sessionsSubText}>total</Text>
                </View>
              </View>

              {/* Recovery SVG circle */}
              <View style={styles.recoveryBox}>
                <Text style={styles.dashboardLabelRight}>Weekly Progress</Text>
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
                    <Text style={styles.recoveryValue}>{recoveryPercentage}%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Row: Improvement & Current Streak */}
            <View style={styles.dashboardBottomRow}>
              <View style={styles.bottomStatBox}>
                <Text style={styles.dashboardLabel}>Current Plan Progress</Text>
                <View style={styles.trendingRow}>
                  <Feather name="trending-up" size={15} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={styles.improvementValue}>{activePlan?.progress_percent ?? 0}%</Text>
                </View>
              </View>

              <View style={styles.bottomStatBoxRight}>
                <Text style={styles.dashboardLabelRight}>Current Streak</Text>
                <Text style={styles.streakValue}>
                  {summary?.current_streak_days ?? 0} <Text style={styles.streakLabel}>Days</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Active Program Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Movement Plan</Text>
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
                  <Text style={styles.programBadgeText}>
                    {activePlan?.progress_status === 'completed' ? 'COMPLETED' : 'ACTIVE PLAN'}
                  </Text>
                </View>
              </View>

              <View style={styles.programTitleProgressRow}>
                <Text style={styles.programTitle}>
                  {activePlan?.plan_name ?? 'No Active Movement Plan'}
                </Text>
                <Text style={styles.programProgressPercent}>
                  {activePlan?.progress_percent ?? 0}%
                </Text>
              </View>

              {/* Custom Track Bar */}
              <View style={styles.trackBarTrack}>
                <View style={[styles.trackBarFill, { width: `${activePlan?.progress_percent ?? 0}%` }]} />
              </View>
            </View>
          </View>

          {/* Weekly Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
          </View>

          <View style={styles.weeklyActivityCard}>
            <View style={styles.weeklyCirclesRow}>
              {weekDates.map((day) => {
                const isCompleted = summary?.completed_dates_this_week.includes(day.key) ?? false;
                return (
                  <View key={day.key} style={styles.weeklyDayItem}>
                    <View style={isCompleted ? styles.weeklyCircleCompleted : styles.weeklyCircleEmpty}>
                      {isCompleted && <Feather name="check" size={12} color="#050B14" />}
                    </View>
                    <Text
                      style={[
                        styles.dayLetter,
                        isCompleted ? styles.dayLetterCompleted : styles.dayLetterIncomplete,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Steps</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.milestonesScrollContent}
          >
            {nextSteps.map((card) => (
              <View key={card.id} style={styles.milestoneCard}>
                <Text style={[styles.milestoneBadgeText, { color: card.badgeColor }]}>
                  {card.badge}
                </Text>
                <Text style={styles.milestoneTitle}>{card.title}</Text>
                <Text style={styles.milestoneSubtitle}>{card.subtitle}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Recent Wins */}
          <View style={styles.sectionHeaderViewAll}>
            <Text style={styles.sectionTitle}>Recent Wins</Text>

          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScrollContent}
          >
            {achievements.map((item) => (
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
                <Text style={styles.achievementTitle} numberOfLines={3}>
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
                You&apos;re building healthier movement habits every week. Keep it up!
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
      gap: 12,
      marginBottom: 10,
    },
    programTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
    programProgressPercent: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.secondary,
      flexShrink: 0,
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
    weeklyCirclesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    weeklyDayItem: {
      alignItems: 'center',
      gap: 8,
    },
    weeklyCircleCompleted: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    weeklyCircleEmpty: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.inputBorder,
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
      width: 260,
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
