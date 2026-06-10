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

export interface Routine {
  id: string;
  title: string;
  duration: string;
  equipment: RoutineEquipment[];
  phases: RoutinePhase[];
}

interface RoutineCardProps {
  routine: Routine;
  isSaved: boolean;
  onToggleSave: () => void;
  onSeeDetails: () => void;
}

const EQUIPMENT_IMAGES: Record<string, any> = {
  'Yoga Mat': require('@/assets/images/equipments/yogaMat.png'),
  'Resistance Band': require('@/assets/images/equipments/resistanceBand.png'),
};

export function RoutineCard({ routine, isSaved, onToggleSave, onSeeDetails }: RoutineCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      {/* Routine Title */}
      <Text style={styles.cardTitle}>{routine.title}</Text>

      {/* Equipment Needed Section */}
      <View style={styles.equipmentSection}>
        <Text style={styles.equipmentSectionTitle}>Equipment Needed:</Text>
        <View style={styles.equipmentCardsRow}>
          {routine.equipment.map((eq, index) => {
            const imageAsset = EQUIPMENT_IMAGES[eq.name];
            return (
              <View key={index} style={styles.equipmentCard}>
                {imageAsset ? (
                  <Image source={imageAsset} style={styles.equipmentImage} />
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
        <Text style={styles.metaDurationText}>{routine.duration}</Text>
      </View>

      {/* Phase Descriptions */}
      <View style={styles.phasesContainer}>
        {routine.phases.map((ph, index) => (
          <View key={index} style={styles.phaseRow}>
            <View style={styles.phaseIndicatorLine} />
            <View style={styles.phaseContent}>
              <Text style={styles.phaseText}>
                PHASE : <Text style={styles.phaseNameHighlight}>{ph.phase.toUpperCase()}</Text>
              </Text>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {ph.name}
              </Text>
            </View>
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
          onPress={onToggleSave}
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
      marginHorizontal: 24,
      padding: 24,
      marginBottom: 20,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 14,
      letterSpacing: -0.4,
    },
    equipmentSection: {
      marginBottom: 14,
    },
    equipmentSectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.quaternary || theme.secondary,
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    equipmentCardsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    equipmentCard: {
      width: 114,
      height: 90,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    equipmentImage: {
      width: 48,
      height: 34,
      contentFit: 'contain',
    },
    equipmentImagePlaceholder: {
      width: 48,
      height: 34,
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
      gap: 12,
    },
    phaseRow: {
      flexDirection: 'row',
    },
    phaseIndicatorLine: {
      width: 2,
      backgroundColor: 'rgba(93, 230, 255, 0.25)',
      borderRadius: 1,
    },
    phaseContent: {
      marginLeft: 12,
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
      color: theme.quaternary || theme.secondary,
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
