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
import { Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';

interface AssessmentCard {
  id: string;
  title: string;
  before: string;
  now: string;
}

interface AchievementItem {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  glowColor: string;
  locked: boolean;
}

const ASSESSMENT_DATA: AssessmentCard[] = [
  { id: '1', title: 'Hip Internal Rotation', before: 'Limited', now: 'Improved' },
  { id: '2', title: 'Shoulder Extension', before: 'Restricted', now: 'Improved' },
  { id: '3', title: 'Ankle Dorsiflexion', before: 'Stiff', now: 'Improved' },
];

const ACHIEVEMENTS_DATA: AchievementItem[] = [
  {
    id: '1',
    title: '7 Day Streak',
    icon: 'star',
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    locked: false,
  },
  {
    id: '2',
    title: 'Program Master',
    icon: 'award',
    color: '#44E2CD',
    glowColor: 'rgba(68, 226, 205, 0.15)',
    locked: false,
  },
  {
    id: '3',
    title: 'Consistency King',
    icon: 'shield',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    locked: false,
  },
  {
    id: '4',
    title: 'Early Bird',
    icon: 'lock',
    color: '#64748B',
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
      Alert.alert('Locked Achievement', 'Complete an exercise before 8:00 AM to unlock the Early Bird badge!');
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

          {/* What You've Improved */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What You've Improved</Text>
          </View>

          <View style={styles.improvementCard}>
            {/* Hip Mobility */}
            <View style={styles.metricRow}>
              <View style={styles.metricLabelRow}>
                <Text style={styles.metricName}>Hip Mobility</Text>
                <Text style={styles.metricStatusText}>Significant (+15%)</Text>
              </View>
              <View style={styles.metricTrack}>
                <View style={[styles.metricFill, { width: '80%', backgroundColor: '#3B82F6' }]} />
              </View>
            </View>

            {/* Posture */}
            <View style={styles.metricRow}>
              <View style={styles.metricLabelRow}>
                <Text style={styles.metricName}>Posture</Text>
                <Text style={styles.metricStatusText}>Optimal</Text>
              </View>
              <View style={styles.metricTrack}>
                <View style={[styles.metricFill, { width: '95%', backgroundColor: '#3B82F6' }]} />
              </View>
            </View>

            {/* Movement Quality */}
            <View style={styles.metricRow}>
              <View style={styles.metricLabelRow}>
                <Text style={styles.metricName}>Movement Quality</Text>
                <Text style={styles.metricStatusText}>Progressing</Text>
              </View>
              <View style={styles.metricTrack}>
                <View style={[styles.metricFill, { width: '45%', backgroundColor: '#3B82F6' }]} />
              </View>
            </View>
          </View>

          {/* Assessment Comparison Horizontal Row */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assessment Comparison</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.assessmentScrollContent}
          >
            {ASSESSMENT_DATA.map((card) => (
              <View key={card.id} style={styles.assessmentCard}>
                <Text style={styles.assessmentCardTitle}>{card.title}</Text>
                <View style={styles.assessmentCardRow}>
                  <View style={styles.comparisonBox}>
                    <Text style={styles.comparisonLabel}>BEFORE</Text>
                    <Text style={styles.beforeValue}>{card.before}</Text>
                  </View>

                  <Feather name="arrow-right" size={16} color={theme.textSecondary} style={styles.arrowSpacing} />

                  <View style={styles.comparisonBoxRight}>
                    <Text style={styles.comparisonLabelRight}>NOW</Text>
                    <Text style={styles.nowValue}>{card.now}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Achievements */}
          <View style={styles.sectionHeaderViewAll}>
            <Text style={styles.sectionTitle}>Achievements</Text>
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
                  <Feather name={item.icon} size={18} color={item.locked ? '#475569' : item.color} />
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
      color: theme.textSecondary,
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
    improvementCard: {
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
    metricRow: {
      marginBottom: 18,
    },
    metricLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    metricStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.secondary,
    },
    metricTrack: {
      height: 6,
      backgroundColor: theme.inputBackground,
      borderRadius: 3,
      overflow: 'hidden',
    },
    metricFill: {
      height: '100%',
      borderRadius: 3,
    },
    assessmentScrollContent: {
      paddingLeft: 24,
      paddingRight: 12,
      marginBottom: 28,
    },
    assessmentCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 16,
      marginRight: 14,
      width: 260,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    assessmentCardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 12,
    },
    assessmentCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    comparisonBox: {
      flex: 1,
    },
    comparisonBoxRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    comparisonLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.textSecondary,
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    comparisonLabelRight: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.textSecondary,
      marginBottom: 4,
      letterSpacing: 0.5,
      textAlign: 'right',
    },
    beforeValue: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FF6B6B',
    },
    nowValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.secondary,
    },
    arrowSpacing: {
      marginHorizontal: 12,
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
