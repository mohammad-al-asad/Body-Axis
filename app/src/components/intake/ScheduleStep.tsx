import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
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
  onNext: () => void;
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
  const styles = createStyles(theme);

  const [showWeeksSheet, setShowWeeksSheet] = useState(false);

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

          <View style={styles.divider} />

          <View style={styles.summaryFooter}>
            <View>
              <Text style={styles.efficiencyLabel}>EFFICIENCY</Text>
              <Text style={styles.efficiencyValue}>{efficiency}% Efficiency</Text>
            </View>
            <View style={styles.ringWrapper}>
              <Svg width={40} height={40} viewBox="0 0 40 40">
                <Circle cx="20" cy="20" r="16" stroke={theme.inputBorder} strokeWidth="3.5" fill="none" />
                <Circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke={theme.secondary}
                  strokeWidth="3.5"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - efficiency / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </Svg>
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
            title="See My Movement Plans"
            onPress={onNext}
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
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
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
  });
