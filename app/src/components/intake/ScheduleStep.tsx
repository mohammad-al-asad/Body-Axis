import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Modal, TextInput } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { useTheme, useThemeState } from "@/hooks/use-theme";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomSheet } from "@/components/ui/CustomSheet";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface ScheduleStepProps {
  scheduleDays: number;
  setScheduleDays: (val: number) => void;
  scheduleWeeks: number;
  setScheduleWeeks: (val: number) => void;
  sessionDuration: number;
  setSessionDuration: (val: number) => void;
  onNext: (sessionName?: string) => void;
  onGoToHome: () => void;
  isSaving?: boolean;
}

const weekOptions = [
  { label: "2 Weeks", value: 2 },
  { label: "3-4 Weeks (Recommended)", value: 3 },
  { label: "4 Weeks", value: 4 },
];

export function ScheduleStep({
  scheduleDays,
  setScheduleDays,
  scheduleWeeks,
  setScheduleWeeks,
  sessionDuration,
  setSessionDuration,
  onNext,
  onGoToHome,
  isSaving = false,
}: ScheduleStepProps) {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  const [showWeeksSheet, setShowWeeksSheet] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionName, setSessionName] = useState("");

  const handleConfirmPress = () => {
    setShowNameModal(true);
  };

  const handleSaveName = () => {
    setShowNameModal(false);
    onNext(sessionName);
  };

  const handleCancelName = () => {
    setShowNameModal(false);
  };

  // Efficiency calculation
  const efficiency = Math.round(((scheduleDays * sessionDuration) / 180) * 98);

  // Determine weeks display label
  const displayWeeksText =
    scheduleWeeks === 3 ? "3-4 Weeks" : `${scheduleWeeks} Weeks`;

  return (
    <View style={styles.slide}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Header */}
        <Text style={styles.title}>You Movement Schedule</Text>
        <Text style={styles.subtitle}>
          Pick what works for your life and we&apos;ll build around it.
        </Text>

        {/* Days Per Week Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Days per week</Text>
          <View style={styles.cardsRow}>
            {[2, 3, 4].map((days) => {
              const isSelected = scheduleDays === days;
              return (
                <TouchableOpacity
                  key={days}
                  activeOpacity={0.85}
                  onPress={() => setScheduleDays(days)}
                  style={[
                    styles.cardBtn,
                    isSelected && styles.cardBtnSelected,
                  ]}
                >
                  <Text style={[styles.cardVal, isSelected && styles.cardTextSelected]}>
                    {days}
                  </Text>
                  <Text style={[styles.cardLabel, isSelected && styles.cardTextSelected]}>
                    DAYS
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Total Weeks Card Section */}
        <View style={styles.weeksCard}>
          <Text style={styles.weeksCardTitle}>Total Weeks</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowWeeksSheet(true)}
            style={styles.dropdownWrapper}
          >
            <View>
              <Text style={styles.dropdownLabel}>Select Duration</Text>
              <Text style={styles.dropdownValue}>{displayWeeksText}</Text>
            </View>
            <Feather name="chevron-down" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          <View style={styles.recommendedRow}>
            <Feather name="clock" size={14} color={theme.textSecondary} />
            <Text style={styles.recommendedText}>(Recommended for best results)</Text>
          </View>
        </View>

        {/* Session Duration Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.durationTitleRow}>
            <Feather name="clock" size={14} color={theme.secondary} style={{ marginRight: 6 }} />
            <Text style={styles.durationHeaderLabel}>Session Duration</Text>
          </View>
          <View style={styles.cardsRow}>
            {[15, 30, 45].map((dur) => {
              const isSelected = sessionDuration === dur;
              return (
                <TouchableOpacity
                  key={dur}
                  activeOpacity={0.85}
                  onPress={() => setSessionDuration(dur)}
                  style={[
                    styles.cardBtn,
                    isSelected && styles.cardBtnSelected,
                  ]}
                >
                  <Text style={[styles.cardVal, isSelected && styles.cardTextSelected]}>
                    {dur}
                  </Text>
                  <Text style={[styles.cardLabel, isSelected && styles.cardTextSelected]}>
                    MIN
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Schedule Summary Section */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>SCHEDULE SUMMARY</Text>
          
          <View style={styles.summaryList}>
            <View style={styles.summaryItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.summaryText}>{scheduleDays} Days per Week</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.summaryText}>{displayWeeksText} Duration</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.summaryText}>{sessionDuration} Min Session</Text>
            </View>
          </View>
        </View>

        {/* Optimal Movement Pace Banner */}
        <View style={styles.paceCard}>
          <Text style={styles.paceDesc}>
            <Text style={styles.paceHighlight}>Optimal Movement Pace:</Text> Based on your selections, we recommend moving <Text style={styles.paceHighlight}>{scheduleDays} days a week</Text> for <Text style={styles.paceHighlight}>{displayWeeksText}</Text> for the best results.
          </Text>
        </View>

        {/* Footer actions */}
        <View style={styles.footer}>
          <CustomButton
            title="Confirm My Movement Session"
            onPress={handleConfirmPress}
            style={styles.actionBtn}
            isLoading={isSaving}
            disabled={isSaving}
          />
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={onGoToHome}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dropdown custom sheet */}
      <CustomSheet
        visible={showWeeksSheet}
        onClose={() => setShowWeeksSheet(false)}
        title="Select Duration"
        options={weekOptions}
        selectedValue={scheduleWeeks}
        onSelect={(val) => setScheduleWeeks(val)}
      />

      {/* Set Session Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelName}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Session Name</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Shoulder workout"
              placeholderTextColor={themeState === 'dark' ? '#5C6E84' : '#9CA3AF'}
              value={sessionName}
              onChangeText={setSessionName}
              autoFocus
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
                onPress={handleCancelName}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                activeOpacity={0.8}
                onPress={handleSaveName}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) =>
  StyleSheet.create({
    slide: {
      width: SCREEN_WIDTH,
      paddingHorizontal: 24,
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
      marginTop: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.6,
      marginBottom: 8,
      lineHeight: 36,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 24,
    },
    sectionContainer: {
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textSecondary,
      marginBottom: 12,
    },
    cardsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    cardBtn: {
      flex: 1,
      height: 72,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    cardBtnSelected: {
      backgroundColor: theme.secondary,
      borderColor: theme.secondary,
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    cardVal: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 2,
    },
    cardLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 0.8,
    },
    cardTextSelected: {
      color: "#050B14", // Dark background color
    },
    weeksCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      padding: 16,
      marginBottom: 24,
    },
    weeksCardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 12,
    },
    dropdownWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    dropdownLabel: {
      fontSize: 10,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    dropdownValue: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    recommendedRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 4,
    },
    recommendedText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 6,
    },
    durationTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    durationHeaderLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    summaryCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
    },
    summaryTitle: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.secondary,
      letterSpacing: 1,
      marginBottom: 16,
    },
    summaryList: {
      gap: 12,
      marginBottom: 20,
    },
    summaryItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.secondary,
      marginRight: 12,
    },
    summaryText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
    },
    divider: {
      height: 1,
      backgroundColor: theme.inputBorder,
      marginBottom: 20,
    },
    summaryFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    efficiencyLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.textSecondary,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    efficiencyValue: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.secondary,
    },
    ringWrapper: {
      width: 40,
      height: 40,
    },
    paceCard: {
      backgroundColor: "#080F1B", // Lighter slate navy
      borderLeftWidth: 3,
      borderLeftColor: theme.secondary,
      borderRadius: 8,
      padding: 16,
      marginBottom: 28,
    },
    paceDesc: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    paceHighlight: {
      color: theme.secondary,
      fontWeight: "700",
    },
    footer: {
      marginTop: 8,
      gap: 12,
      alignItems: "center",
    },
    actionBtn: {
      width: "100%",
    },
    backBtn: {
      paddingVertical: 12,
      width: "100%",
      alignItems: "center",
    },
    backBtnText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    modalContent: {
      width: '100%',
      maxWidth: 320,
      backgroundColor: themeState === 'dark' ? '#1E2633' : theme.cardBackground,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeState === 'dark' ? '#2A3649' : theme.inputBorder,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalInput: {
      width: '100%',
      height: 52,
      backgroundColor: themeState === 'dark' ? '#0F141C' : theme.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 15,
      color: theme.text,
      borderWidth: 1,
      borderColor: themeState === 'dark' ? '#2A3649' : theme.inputBorder,
      marginBottom: 24,
    },
    modalButtonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 8,
    },
    modalCancelBtn: {
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    modalCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#94A3B8',
    },
    modalSaveBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSaveText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  });
