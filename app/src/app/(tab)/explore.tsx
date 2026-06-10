import React, { useState, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { RoutineCard } from '@/components/RoutineCard';

export interface ExercisePhase {
  phase: 'RESET' | 'CONTROL' | 'INTEGRATE';
  name: string;
}

export interface ResetRoutine {
  id: string;
  title: string;
  duration: string;
  equipment: { icon: keyof typeof Feather.glyphMap; name: string }[];
  phases: ExercisePhase[];
}

export const ROUTINES: ResetRoutine[] = [
  {
    id: '1',
    title: 'The Achy Shoulder Reset',
    duration: '~15 Mins',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
    ],
    phases: [
      { phase: 'RESET', name: 'Side-Lying Thoracic Rotation (Open Book)' },
      { phase: 'CONTROL', name: 'Prone Trap Raise' },
      { phase: 'INTEGRATE', name: 'Side-Lying Shoulder External Rotation' },
    ],
  },
  {
    id: '2',
    title: 'The Shoulder Impingement Reset',
    duration: '~15 Mins',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
    ],
    phases: [
      { phase: 'RESET', name: 'Suboccipital Release + Chin Nod' },
      { phase: 'CONTROL', name: 'Serratus Wall Slide' },
      { phase: 'INTEGRATE', name: 'Side-Lying Low Trap Raise' },
    ],
  },
  {
    id: '3',
    title: 'The Achy Ankle Reset',
    duration: '~15 Mins',
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
];

export default function ExploreScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Filter routines in real-time based on the search query
  const filteredRoutines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ROUTINES;
    return ROUTINES.filter(
      (routine) =>
        routine.title.toLowerCase().includes(query) ||
        routine.phases.some((phase) => phase.name.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const toggleSave = (routine: ResetRoutine) => {
    const isSaved = savedIds.includes(routine.id);
    if (isSaved) {
      setSavedIds((prev) => prev.filter((id) => id !== routine.id));
      Alert.alert('Removed', `${routine.title} removed from saved list`);
    } else {
      setSavedIds((prev) => [...prev, routine.id]);
      Alert.alert('Saved', `${routine.title} saved successfully!`);
    }
  };

  const handleSeeDetails = (routine: ResetRoutine) => {
    router.push({
      pathname: '/routine-details',
      params: { id: routine.id },
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
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
              {/* Movement Library Header Titles */}
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>
                  Movement Library
                </Text>
                <Text style={styles.subtitle}>
                  Optimize your biomechanics through our curated database of corrective and performance-based exercises.
                </Text>
              </View>

              {/* Search Bar Input Container */}
              <View style={styles.searchContainer}>
                <Feather name="search" size={18} color={theme.textSecondary} style={styles.searchIcon} />
                <TextInput
                  placeholder="Search"
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Feather name="x" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Curated Routine Cards List */}
              {filteredRoutines.length > 0 ? (
                filteredRoutines.map((routine) => {
                  const isSaved = savedIds.includes(routine.id);
                  return (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      isSaved={isSaved}
                      onToggleSave={() => toggleSave(routine)}
                      onSeeDetails={() => handleSeeDetails(routine)}
                    />
                  );
                })
              ) : (
                <View style={styles.noResultsContainer}>
                  <Feather name="frown" size={40} color={theme.textSecondary} style={{ marginBottom: 12 }} />
                  <Text style={styles.noResultsText}>No routines found matching your search</Text>
                </View>
              )}
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
      paddingBottom: 40,
    },
    titleContainer: {
      alignItems: 'center',
      paddingHorizontal: 24,
      marginTop: 24,
      marginBottom: 24,
    },
    mainTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      height: 48,
      marginHorizontal: 24,
      paddingHorizontal: 14,
      marginBottom: 28,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      height: '100%',
    },
    clearButton: {
      padding: 4,
    },
    noResultsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
      paddingHorizontal: 40,
    },
    noResultsText: {
      color: theme.textSecondary,
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
