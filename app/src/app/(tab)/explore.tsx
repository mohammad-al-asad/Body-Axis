import { Image } from 'expo-image';
import React, { useState, useMemo } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';

interface ExercisePhase {
  phase: 'RESET' | 'CONTROL' | 'INTEGRATE';
  name: string;
}

interface ResetRoutine {
  id: string;
  title: string;
  duration: string;
  equipment: { icon: keyof typeof Feather.glyphMap; name: string }[];
  phases: ExercisePhase[];
}

const ROUTINES: ResetRoutine[] = [
  {
    id: '1',
    title: 'The Achy Shoulder Reset',
    duration: '~15 Mins',
    equipment: [
      { icon: 'activity', name: 'Resistance Band' },
      { icon: 'target', name: 'Massage Ball' },
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
      { icon: 'activity', name: 'Resistance Band' },
      { icon: 'disc', name: 'Foam Roller' },
      { icon: 'target', name: 'Massage Ball' },
      { icon: 'layers', name: 'Strap Loop' },
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
      { icon: 'target', name: 'Massage Ball' },
      { icon: 'layers', name: 'Strap Loop' },
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
    Alert.alert(
      routine.title,
      `Duration: ${routine.duration}\n\nEquipment needed:\n${routine.equipment
        .map((eq) => `• ${eq.name}`)
        .join('\n')}\n\nPhases:\n${routine.phases
        .map((ph) => `[${ph.phase}] ${ph.name}`)
        .join('\n')}`,
      [{ text: 'Close', style: 'cancel' }]
    );
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
                  Movement <Text style={styles.highlightTitle}>Library</Text>
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
                    <View key={routine.id} style={styles.card}>
                      {/* Routine Title */}
                      <Text style={styles.cardTitle}>{routine.title}</Text>

                      {/* Routine Metadata Sub-row (Mins, Equipment) */}
                      <View style={styles.metaRow}>
                        <View style={styles.metaLeft}>
                          <Feather name="clock" size={13} color={theme.secondary} style={styles.metaIcon} />
                          <Text style={styles.metaDurationText}>{routine.duration}</Text>
                        </View>
                        <View style={styles.metaRight}>
                          <Text style={styles.equipmentLabel}>Equipment : </Text>
                          <View style={styles.equipmentIconsRow}>
                            {routine.equipment.map((eq, index) => (
                              <View key={index} style={styles.equipmentIconWrapper}>
                                <Feather name={eq.icon} size={11} color={theme.text} />
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>

                      {/* Phase Descriptions */}
                      <View style={styles.phasesContainer}>
                        {routine.phases.map((ph, index) => (
                          <View key={index} style={styles.phaseRow}>
                            <View style={styles.phaseLabelContainer}>
                              <Text style={styles.phaseText}>
                                PHASE : <Text style={styles.phaseNameHighlight}>{ph.phase}</Text>
                              </Text>
                            </View>
                            <Text style={styles.exerciseName} numberOfLines={1}>
                              {ph.name}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Action Buttons Row */}
                      <View style={styles.cardActionsRow}>
                        <TouchableOpacity
                          style={[
                            styles.saveButton,
                            isSaved && {
                              borderColor: theme.secondary,
                              backgroundColor: 'rgba(93, 230, 255, 0.08)',
                            },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => toggleSave(routine)}
                        >
                          <Text
                            style={[
                              styles.saveButtonText,
                              isSaved && { color: theme.secondary, fontWeight: '700' },
                            ]}
                          >
                            {isSaved ? 'Saved  ✓' : 'Save'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.detailsButton}
                          activeOpacity={0.8}
                          onPress={() => handleSeeDetails(routine)}
                        >
                          <Text style={styles.detailsButtonText}>See Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
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
      marginTop: 18,
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
    highlightTitle: {
      color: theme.secondary,
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
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      marginHorizontal: 24,
      padding: 24,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 12,
      letterSpacing: -0.2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    metaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaIcon: {
      marginRight: 6,
    },
    metaDurationText: {
      color: theme.secondary,
      fontSize: 13,
      fontWeight: '600',
    },
    metaRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    equipmentLabel: {
      fontSize: 13,
      color: theme.secondary,
      fontWeight: '600',
    },
    equipmentIconsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    equipmentIconWrapper: {
      width: 22,
      height: 22,
      borderRadius: 6,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    phasesContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.inputBorder,
      paddingTop: 16,
      marginBottom: 24,
      gap: 12,
    },
    phaseRow: {
      flexDirection: 'column',
      gap: 4,
    },
    phaseLabelContainer: {
      alignSelf: 'flex-start',
    },
    phaseText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 1.0,
    },
    phaseNameHighlight: {
      color: theme.secondary,
    },
    exerciseName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    cardActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    saveButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.cardBorder,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '600',
    },
    detailsButton: {
      flex: 1.2,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    detailsButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
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
