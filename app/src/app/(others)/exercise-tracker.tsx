import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { ROUTINES } from '../(tab)/explore';


export default function ExerciseTrackerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, initialPhaseIndex } = useLocalSearchParams<{ id: string; initialPhaseIndex?: string }>();

  // Fetch selected routine (fallback to routine 1)
  const routine = ROUTINES.find((r) => r.id === id) || ROUTINES[0];

  // Current exercise phase index (0, 1, 2)
  const [currentIdx, setCurrentIdx] = useState<number>(
    initialPhaseIndex ? parseInt(initialPhaseIndex, 10) : 0
  );

  // Set number (1 or 2)
  const [currentSet, setCurrentSet] = useState<number>(1);

  // Rest timer seconds (counting down from 43 for visual flair)
  const [restSeconds, setRestSeconds] = useState<number>(43);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            return 60; // Loop rest timer back to 60s
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPhase = routine.phases[currentIdx] || routine.phases[0];
  const upcomingPhase = routine.phases[currentIdx + 1];

  // Sets & Reps mapping (matching exercise details)
  const repsMap: Record<string, string> = {
    'Side-Lying Thoracic Rotation (Open Book)': '10 REPS',
    'Prone Trap Raise': '12 REPS',
    'Side-Lying Shoulder External Rotation': '10 REPS',
    'Suboccipital Release + Chin Nod': '10s HOLD',
    'Serratus Wall Slide': '10 REPS',
    'Side-Lying Low Trap Raise': '10 REPS',
    'Short Foot Activation Hold': '10s HOLD',
    'Standing Soleus Knee Bend Hold': '30s HOLD',
    'Single-Leg RNT Squat': '10 REPS',
  };

  const targetReps = repsMap[currentPhase.name] || '10 REPS';

  const handleLogSet = () => {
    if (currentSet < 2) {
      setCurrentSet(2);
      // Reset rest timer for visual change
      setRestSeconds(60);
    } else {
      // If we finished set 2, advance to next exercise or exit
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    if (currentIdx < routine.phases.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setCurrentSet(1);
      setRestSeconds(45);
    } else {
      // Protocol finished, go back to explorer tab
      router.replace('/(tab)/explore');
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header without Back Press (as requested) */}
        <Header onBackPress={()=>router.back()} showNotification={true} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Progress Info */}
          <View style={styles.progressHeaderRow}>
            <View>
              <Text style={styles.progressStatusText}>PLAN IN PROGRESS</Text>
              <Text style={styles.progressSubText}>
                EXERCISE {currentIdx + 1} OF {routine.phases.length}
              </Text>
            </View>
          </View>

          {/* Exercise Meta */}
          <View style={styles.exerciseMetaSection}>
            <Text style={styles.phaseLabel}>
              PHASE : <Text style={styles.phaseLabelHighlight}>{currentPhase.phase.toUpperCase()}</Text>
            </Text>
            <Text style={styles.exerciseTitle} numberOfLines={2}>
              {currentPhase.name}
            </Text>
            <Text style={styles.setLabel}>SET {currentSet}</Text>
          </View>

          {/* Circle Counter Card */}
          <View style={styles.counterCard}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Text style={styles.counterNumber}>
                  {currentSet.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.counterRepsLabel}>/ {targetReps}</Text>
              </View>
            </View>
          </View>

          {/* Rest Timer Bar */}
          <TouchableOpacity
            style={styles.restTimerRow}
            activeOpacity={0.8}
            onPress={() => setIsTimerRunning(!isTimerRunning)}
          >
            <View style={styles.restTimerLeft}>
              <View style={styles.clockIconWrapper}>
                <Feather name="clock" size={16} color={theme.secondary} />
              </View>
              <View style={styles.restTimerTextCol}>
                <Text style={styles.restTimerLabel}>REST TIMER</Text>
                <Text style={styles.restTimerVal}>{formatTime(restSeconds)}</Text>
              </View>
            </View>
            <Feather
              name={isTimerRunning ? "pause" : "play"}
              size={16}
              color={theme.textSecondary}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          {/* Upcoming Section */}
          <Text style={styles.upcomingHeader}>UPCOMING</Text>
          {upcomingPhase ? (
            <View style={styles.upcomingCard}>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingPhaseType}>
                  PHASE : {upcomingPhase.phase.toUpperCase()}
                </Text>
                <Text style={styles.upcomingName} numberOfLines={1}>
                  {upcomingPhase.name}
                </Text>
              </View>
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>NEXT</Text>
              </View>
            </View>
          ) : (
            <View style={styles.upcomingCard}>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingPhaseType}>ROUTINE COMPLETE NEXT</Text>
                <Text style={styles.upcomingName}>Finish up and log your routine</Text>
              </View>
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>END</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation Buttons */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.logBtn}
            activeOpacity={0.8}
            onPress={handleLogSet}
          >
            <Text style={styles.logBtnText}>
              {currentSet < 2 ? 'Log Set & Rest' : 'Log Set 2 & Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextBtn}
            activeOpacity={0.8}
            onPress={handleNextExercise}
          >
            <Text style={styles.nextBtnText}>
              {currentIdx < routine.phases.length - 1 ? 'Next Exercise' : 'Finish Routine'}
            </Text>
          </TouchableOpacity>
        </View>
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
      paddingHorizontal: 24,
      paddingBottom: 110,
    },
    progressHeaderRow: {
      marginTop: 8,
      marginBottom: 20,
    },
    progressStatusText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 1.2,
      marginBottom: 4,
    },
    progressSubText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    exerciseMetaSection: {
      marginBottom: 20,
    },
    phaseLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 1.0,
      marginBottom: 6,
    },
    phaseLabelHighlight: {
      color: '#C084FC', // Purple phase label highlight
    },
    exerciseTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.5,
      lineHeight: 32,
      marginBottom: 6,
    },
    setLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    counterCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 24,
      height: 260,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    outerCircle: {
      width: 190,
      height: 190,
      borderRadius: 95,
      borderWidth: 5,
      borderColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
    },
    innerCircle: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    counterNumber: {
      fontSize: 64,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -1,
    },
    counterRepsLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
      marginTop: 2,
    },
    restTimerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 28,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    restTimerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    clockIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    restTimerTextCol: {
      justifyContent: 'center',
    },
    restTimerLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    restTimerVal: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    chevronIcon: {
      marginRight: 4,
    },
    upcomingHeader: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 1.0,
      marginBottom: 10,
    },
    upcomingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    upcomingInfo: {
      flex: 1,
      paddingRight: 12,
    },
    upcomingPhaseType: {
      fontSize: 8,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    upcomingName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    nextBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    nextBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    footerRow: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
    },
    logBtn: {
      flex: 1.1,
      height: 50,
      borderRadius: 14,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    logBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
    nextBtn: {
      flex: 0.9,
      height: 50,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.secondary,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    nextBtnText: {
      color: theme.secondary,
      fontSize: 14,
      fontWeight: '800',
    },
  });
