import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme, useThemeState } from "@/hooks/use-theme";
import { CustomButton } from "@/components/ui/CustomButton";
import { SessionPlan } from "@/redux/api/sessionApi";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PlanSelectionStepProps {
  plans: SessionPlan[];
  selectedPlanIds: string[];
  onTogglePlan: (planId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
  onAdjustConfigurations: () => void;
}

export function PlanSelectionStep({
  plans,
  selectedPlanIds,
  onTogglePlan,
  onSelectAll,
  onDeselectAll,
  isLoading,
  onNext,
  onBack,
  onAdjustConfigurations,
}: PlanSelectionStepProps) {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  const [expandedPlanIds, setExpandedPlanIds] = useState<string[]>([]);

  const toggleExpand = (planId: string) => {
    setExpandedPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  const allSelected = plans.length > 0 && selectedPlanIds.length === plans.length;

  const getPlanIdentifier = (plan: SessionPlan): string => {
    return plan.id || plan.plan_id;
  };

  const getExerciseCount = (plan: SessionPlan): number => {
    if (plan.total_exercise_count) return plan.total_exercise_count;
    const phases = plan.phases || {};
    return (
      (phases.reset?.length || 0) +
      (phases.control?.length || 0) +
      (phases.integrate?.length || 0)
    );
  };

  return (
    <View style={styles.slide}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Header */}
        <Text style={styles.title}>Select Movement Plans</Text>
        <Text style={styles.subtitle}>
          Choose the plans you want to include in this session. You can select multiple routines.
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.secondary} />
            <Text style={styles.loadingText}>Finding best matching plans...</Text>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="alert-circle" size={32} color={theme.secondary} />
            </View>
            <Text style={styles.emptyTitle}>No Matching Plans Found</Text>
            <Text style={styles.emptySubtitle}>
              We couldn&apos;t find any movement plans for this configuration. Try selecting different target areas, goal, or duration.
            </Text>
            <CustomButton
              title="Change Configuration"
              onPress={onAdjustConfigurations}
              style={styles.adjustBtn}
            />
          </View>
        ) : (
          <>
            {/* Header controls bar */}
            <View style={styles.controlsBar}>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {selectedPlanIds.length} OF {plans.length} SELECTED
                </Text>
              </View>

              {plans.length > 1 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={allSelected ? onDeselectAll : onSelectAll}
                  style={styles.selectToggleBtn}
                >
                  <Text style={styles.selectToggleText}>
                    {allSelected ? "Deselect All" : "Select All"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Plans List */}
            <View style={styles.plansList}>
              {plans.map((plan) => {
                const planId = getPlanIdentifier(plan);
                const isSelected = selectedPlanIds.includes(planId);
                const isExpanded = expandedPlanIds.includes(planId);
                const exerciseCount = getExerciseCount(plan);

                return (
                  <View
                    key={planId}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                    ]}
                  >
                    {/* Header Row with Checkbox & Plan Title */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => onTogglePlan(planId)}
                      style={styles.cardHeaderTouchable}
                    >
                      {/* Checkbox indicator */}
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Feather name="check" size={14} color="#050B14" />
                        )}
                      </View>

                      <View style={styles.cardTitleContainer}>
                        <Text
                          style={[
                            styles.planTitle,
                            isSelected && styles.planTitleSelected,
                          ]}
                          numberOfLines={2}
                        >
                          {plan.plan_name}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Meta Badges */}
                    <View style={styles.badgesRow}>
                      <View style={styles.pillBadge}>
                        <Feather name="target" size={11} color={theme.secondary} style={{ marginRight: 4 }} />
                        <Text style={styles.pillBadgeText}>{plan.target_area}</Text>
                      </View>

                      <View style={styles.pillBadge}>
                        <Feather name="clock" size={11} color={theme.secondary} style={{ marginRight: 4 }} />
                        <Text style={styles.pillBadgeText}>{plan.duration}</Text>
                      </View>

                      <View style={styles.pillBadge}>
                        <MaterialCommunityIcons name="dumbbell" size={12} color={theme.secondary} style={{ marginRight: 4 }} />
                        <Text style={styles.pillBadgeText}>{exerciseCount} Exercises</Text>
                      </View>
                    </View>

                    {/* Equipment tags if any */}
                    {plan.equipment_needed && plan.equipment_needed.length > 0 && (
                      <View style={styles.equipmentRow}>
                        <Text style={styles.equipmentLabel}>Equipment: </Text>
                        <Text style={styles.equipmentValue} numberOfLines={1}>
                          {plan.equipment_needed.join(", ")}
                        </Text>
                      </View>
                    )}

                    {/* Phase breakdown expansion */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleExpand(planId)}
                      style={styles.expandHeader}
                    >
                      <Text style={styles.expandLabel}>
                        {isExpanded ? "Hide Routine Breakdown" : "View Routine Breakdown"}
                      </Text>
                      <Feather
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        {(["reset", "control", "integrate"] as const).map((phaseKey) => {
                          const phaseExercises = plan.phases?.[phaseKey] || [];
                          if (phaseExercises.length === 0) return null;

                          return (
                            <View key={phaseKey} style={styles.phaseBlock}>
                              <View style={styles.phaseHeaderRow}>
                                <View style={styles.phaseIndicator} />
                                <Text style={styles.phaseTitle}>
                                  PHASE: <Text style={styles.phaseTitleHighlight}>{phaseKey.toUpperCase()}</Text>
                                </Text>
                              </View>
                              {phaseExercises.map((ex, idx) => {
                                const setsCount = ex.sets ?? 3;
                                const repsText = ex.reps || "10 reps";
                                return (
                                  <Text key={ex.exercise_id || idx} style={styles.exerciseNameText}>
                                    • {ex.exercise_name} ({setsCount} {setsCount === 1 ? "set" : "sets"}, {repsText})
                                  </Text>
                                );
                              })}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <CustomButton
                title={
                  selectedPlanIds.length > 1
                    ? `Continue with ${selectedPlanIds.length} Plans`
                    : selectedPlanIds.length === 1
                    ? "Continue with 1 Plan"
                    : "Select at least 1 Plan"
                }
                onPress={onNext}
                disabled={selectedPlanIds.length === 0}
                style={styles.actionBtn}
              />
              <TouchableOpacity
                style={styles.backBtn}
                activeOpacity={0.8}
                onPress={onBack}
              >
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (
  theme: ReturnType<typeof useTheme>,
  themeState: ReturnType<typeof useThemeState>
) =>
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
      fontSize: 26,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.6,
      marginBottom: 8,
      lineHeight: 34,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 20,
    },
    loadingContainer: {
      paddingVertical: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    emptyContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      padding: 24,
      alignItems: "center",
      marginTop: 12,
    },
    emptyIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: themeState === "dark" ? "rgba(93, 230, 255, 0.12)" : "#E0F7FA",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 13.5,
      color: theme.textSecondary,
      lineHeight: 20,
      textAlign: "center",
      marginBottom: 20,
    },
    adjustBtn: {
      width: "100%",
    },
    controlsBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    countBadge: {
      backgroundColor: themeState === "dark" ? "#102032" : "#EAFBFF",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: themeState === "dark" ? "rgba(93, 230, 255, 0.3)" : "#2cb09d66",
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.secondary,
      letterSpacing: 0.8,
    },
    selectToggleBtn: {
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    selectToggleText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.secondary,
    },
    plansList: {
      gap: 16,
      marginBottom: 24,
    },
    planCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: theme.inputBorder,
      padding: 18,
      elevation: 2,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    planCardSelected: {
      borderColor: theme.secondary,
      backgroundColor: themeState === "dark" ? "#0A1828" : "#F2FBFA",
    },
    cardHeaderTouchable: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.textSecondary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      marginTop: 2,
    },
    checkboxSelected: {
      backgroundColor: theme.secondary,
      borderColor: theme.secondary,
    },
    cardTitleContainer: {
      flex: 1,
    },
    planTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.text,
      lineHeight: 23,
    },
    planTitleSelected: {
      color: themeState === "dark" ? "#FFFFFF" : "#050B14",
    },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },
    pillBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: themeState === "dark" ? "#0F1E2E" : "#EAF4F4",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    pillBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.textSecondary,
    },
    equipmentRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      paddingTop: 4,
    },
    equipmentLabel: {
      fontSize: 11.5,
      fontWeight: "700",
      color: theme.textSecondary,
    },
    equipmentValue: {
      flex: 1,
      fontSize: 11.5,
      fontWeight: "500",
      color: theme.text,
    },
    expandHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: theme.inputBorder,
      paddingTop: 12,
      marginTop: 6,
    },
    expandLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.secondary,
    },
    expandedContent: {
      marginTop: 12,
      gap: 10,
      paddingLeft: 4,
    },
    phaseBlock: {
      backgroundColor: themeState === "dark" ? "rgba(15, 20, 28, 0.6)" : "rgba(240, 240, 240, 0.6)",
      borderRadius: 10,
      padding: 10,
    },
    phaseHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    phaseIndicator: {
      width: 3,
      height: 12,
      backgroundColor: theme.secondary,
      borderRadius: 1.5,
      marginRight: 6,
    },
    phaseTitle: {
      fontSize: 10.5,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    phaseTitleHighlight: {
      color: theme.secondary,
    },
    exerciseNameText: {
      fontSize: 12.5,
      color: theme.text,
      lineHeight: 18,
      marginLeft: 4,
    },
    footer: {
      marginTop: 12,
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
