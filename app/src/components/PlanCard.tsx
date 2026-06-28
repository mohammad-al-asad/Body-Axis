import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/use-theme';

export interface RoutinePhase {
  phase: string;
  name: string;
}

export interface RoutineEquipment {
  name: string;
  icon: keyof typeof Feather.glyphMap;
}

export interface ResetPlan {
  id: string;
  title: string;
  duration: string;
  isActive?: boolean;
  progressPercent?: number;
  progressLabel?: string;
  equipment: RoutineEquipment[];
  phases: RoutinePhase[];
}

interface PlanCardProps {
  plan: ResetPlan;
  isSaved: boolean;
  saveLabel?: string;
  onToggleSave: () => void;
  onSeeDetails: () => void;
}

const EQUIPMENT_IMAGES: Record<string, any> = {
  'Yoga Mat': require('@/assets/images/equipments/YogaMat.png'),
  'Resistance Band': require('@/assets/images/equipments/ResistanceBand.png'),
  'Dumbbell': require('@/assets/images/equipments/Dumbbell.png'),
  'Foam Roller': require('@/assets/images/equipments/FoamRoller.png'),
  'Lacrosse Ball': require('@/assets/images/equipments/LacrosseBall.png'),
  'Yoga Block': require('@/assets/images/equipments/YogaBlock.png'),
  'Bench': require('@/assets/images/equipments/Bench.png'),
  'Mini Band': require('@/assets/images/equipments/MiniBand.png'),
};

export function PlanCard({ plan, isSaved, saveLabel, onToggleSave, onSeeDetails }: PlanCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      {/* Title & Active Badge Row */}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{plan.title}</Text>
        {plan.isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        )}
      </View>

      {/* Equipment Needed Section */}
      <View style={styles.equipmentSection}>
        <Text style={styles.equipmentSectionTitle}>Equipment Needed:</Text>
        <View style={styles.equipmentGrid}>
          {plan.equipment.map((eq, index) => {
            const imageAsset = EQUIPMENT_IMAGES[eq.name];
            return (
              <View key={index} style={styles.equipmentCard}>
                {imageAsset ? (
                  <Image
                    source={imageAsset}
                    style={styles.equipmentImage}
                    contentFit="contain"
                  />
                ) : (
                  <View style={styles.equipmentImagePlaceholder}>
                    <Feather name={eq.icon} size={18} color={theme.textSecondary} />
                  </View>
                )}
                <Text style={styles.equipmentCardName} numberOfLines={1}>
                  {eq.name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Routine Duration Sub-row */}
      <View style={styles.metaRow}>
        <Feather name="clock" size={13} color={theme.secondary} style={styles.metaIcon} />
        <Text style={styles.metaDurationText}>{plan.duration}</Text>
      </View>

      {/* Phase Descriptions */}
      <View style={styles.phasesContainer}>
        {plan.phases.map((ph, index) => (
          <View key={index} style={styles.phaseRow}>
            <View style={styles.phaseIndicatorLine} />
            <View style={styles.phaseContent}>
              <Text style={styles.phaseText}>
                PHASE {index + 1}: <Text style={styles.phaseNameHighlight}>{ph.phase.toUpperCase()}</Text>
              </Text>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {ph.name}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Progress Bar Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressTextLeft}>{plan.progressLabel || 'Exercise 1 of 3'}</Text>
          <Text style={styles.progressTextRight}>{plan.progressPercent ?? 33}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${plan.progressPercent ?? 33}%` }]} />
        </View>
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
          onPress={onToggleSave}
        >
          <Text
            style={[
              styles.saveButtonText,
              isSaved && { color: theme.secondary, fontWeight: '700' },
            ]}
          >
            {saveLabel ?? (isSaved ? 'Saved  ✓' : 'Save')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          activeOpacity={0.8}
          onPress={onSeeDetails}
        >
          <Text style={styles.detailsButtonText}>See Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 24,
      marginBottom: 20,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.4,
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
    equipmentSection: {
      marginBottom: 14,
    },
    equipmentSectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.quaternary,
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    equipmentGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 10,
    },
    equipmentCard: {
      width: '48.5%', // Always fits exactly 2 columns without rounding wrap issues
      height: 90,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    equipmentImage: {
      width: 60,
      height: 42,
    },
    equipmentImagePlaceholder: {
      width: 60,
      height: 42,
      justifyContent: 'center',
      alignItems: 'center',
    },
    equipmentCardName: {
      marginTop: 6,
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '700',
      textAlign: 'center',
      width: '100%',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 14,
    },
    metaIcon: {
      marginRight: 6,
    },
    metaDurationText: {
      color: theme.secondary,
      fontSize: 13,
      fontWeight: '600',
    },
    phasesContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.inputBorder,
      paddingTop: 16,
      marginBottom: 20,
      gap: 16,
    },
    phaseRow: {
      flexDirection: 'row',
    },
    phaseIndicatorLine: {
      width: 2,
      backgroundColor: theme.secondary,
      borderRadius: 1,
      marginRight: 12,
      alignSelf: 'stretch',
    },
    phaseContent: {
      flex: 1,
      justifyContent: 'center',
    },
    phaseText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    phaseNameHighlight: {
      color: theme.quaternary,
    },
    exerciseName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    progressSection: {
      marginBottom: 20,
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
      backgroundColor: '#141E30',
      borderRadius: 3,
      width: '100%',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.secondary,
      borderRadius: 3,
    },
    cardActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    saveButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.cardBorder === 'transparent' ? '#bdbdbdff' : theme.cardBorder,
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
      borderRadius: 14,
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
  });
