import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { PlanCard, ResetPlan } from '@/components/PlanCard';

export const PLANS: ResetPlan[] = [
  {
    id: '1',
    title: 'Hip Mobility',
    duration: '~15 Mins',
    isActive: true,
    progressPercent: 33,
    progressLabel: 'Plan 1 of 3',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
      { icon: 'activity', name: 'Mini Band' },
      { icon: 'target', name: 'Dumbbell' },
      { icon: 'disc', name: 'Foam Roller' },
      { icon: 'circle', name: 'Lacrosse Ball' },
      { icon: 'box', name: 'Yoga Block' },
      { icon: 'trello', name: 'Bench' },
    ],
    phases: [
      { phase: 'RESET', name: 'Side-Lying Thoracic Rotation (Open Book)' },
      { phase: 'CONTROL', name: 'Prone Trap Raise' },
      { phase: 'INTEGRATE', name: 'Side-Lying Shoulder External Rotation' },
    ],
  },
  {
    id: '2',
    title: 'Shoulder Impingement',
    duration: '~15 Mins',
    isActive: false,
    progressPercent: 33,
    progressLabel: 'Plan 1 of 3',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
      { icon: 'disc', name: 'Foam Roller' },
    ],
    phases: [
      { phase: 'RESET', name: 'Suboccipital Release + Chin Nod' },
      { phase: 'CONTROL', name: 'Serratus Wall Slide' },
      { phase: 'INTEGRATE', name: 'Side-Lying Low Trap Raise' },
    ],
  },
  {
    id: '3',
    title: 'Ankle Stability',
    duration: '~15 Mins',
    isActive: false,
    progressPercent: 33,
    progressLabel: 'Plan 1 of 3',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
    ],
    phases: [
      { phase: 'RESET', name: 'Short Foot Activation Hold' },
      { phase: 'CONTROL', name: 'Standing Soleus Knee Bend Hold' },
      { phase: 'INTEGRATE', name: 'Single-Leg RNT Squat' },
    ],
  },
  {
    id: '4',
    title: 'Full Body Alignment',
    duration: '~30 Mins',
    isActive: false,
    progressPercent: 33,
    progressLabel: 'Plan 1 of 3',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
      { icon: 'activity', name: 'Mini Band' },
      { icon: 'target', name: 'Dumbbell' },
      { icon: 'disc', name: 'Foam Roller' },
      { icon: 'circle', name: 'Lacrosse Ball' },
      { icon: 'box', name: 'Yoga Block' },
      { icon: 'trello', name: 'Bench' },
    ],
    phases: [
      { phase: 'RESET', name: 'Full Body Foam Roll & Lacrosse Release' },
      { phase: 'CONTROL', name: 'Banded Dumbbell Bench Press' },
      { phase: 'INTEGRATE', name: 'Yoga Block Squat Calibration' },
    ],
  },
];

// Compatibility exports
export const ROUTINES = PLANS;

export default function SessionDetailsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleSave = (plan: ResetPlan) => {
    const isSaved = savedIds.includes(plan.id);
    if (isSaved) {
      setSavedIds((prev) => prev.filter((id) => id !== plan.id));
      Alert.alert('Removed', `${plan.title} removed from saved list`);
    } else {
      setSavedIds((prev) => [...prev, plan.id]);
      Alert.alert('Saved', `${plan.title} saved successfully!`);
    }
  };

  const handleSeeDetails = (plan: ResetPlan) => {
    router.push({
      pathname: '/sessions/plan-details',
      params: { id: plan.id },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Section */}
        <Header />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Back Button Container */}
            <TouchableOpacity
              style={styles.backContainer}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={16} color={theme.tertiary} style={styles.backIcon} />
              <Text style={styles.backText}>Go Back</Text>
            </TouchableOpacity>

            {/* Movement Library Header Titles */}
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>
                Hip Mobility + Core Stability
              </Text>
              <Text style={styles.subtitle}>
                Based on your selections, here are your personalized movement plans to choose from.
              </Text>
            </View>

            {/* Curated Plan Cards List */}
            {PLANS.map((plan) => {
              const isSaved = savedIds.includes(plan.id);
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSaved={isSaved}
                  onToggleSave={() => toggleSave(plan)}
                  onSeeDetails={() => handleSeeDetails(plan)}
                />
              );
            })}
          </ScrollView>
        </KeyboardAvoidingView>
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
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
    },
    backContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    backIcon: {
      marginRight: 8,
    },
    backText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.tertiary,
    },
    titleContainer: {
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    mainTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'left',
      marginBottom: 10,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'left',
      lineHeight: 20,
    },
  });
