import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Svg, { Defs, Rect, LinearGradient, Stop } from "react-native-svg";

import { RootState } from "@/redux/store";
import { useTheme, useThemeState } from "@/hooks/use-theme";
import { useSaveIntakeMutation } from "@/redux/api/userApi";
import {
  SessionPlan,
  useCreateSessionMutation,
  useGetMatchingPlansMutation,
} from "@/redux/api/sessionApi";
import { Header } from "@/components/Header";
import { PainAssessmentStep } from "@/components/intake/PainAssessmentStep";
import { GoalStep } from "@/components/intake/GoalStep";
import { ScheduleStep } from "@/components/intake/ScheduleStep";
import { PlanSelectionStep } from "@/components/intake/PlanSelectionStep";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function IntakeScreen() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  // Connect to Redux to check Gender explicitly
  const userGender =
    useSelector((state: RootState) => state.auth.user?.gender) || "female";

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Stateful Intake Answers
  const [avatarView, setAvatarView] = useState<"front" | "back">("front");
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<string>("");

  // Schedule Step
  const [scheduleDays, setScheduleDays] = useState<number>(3);
  const [scheduleWeeks, setScheduleWeeks] = useState<number>(3);
  const [sessionDuration, setSessionDuration] = useState<number>(45);

  // Plan Selection Step
  const [matchingPlans, setMatchingPlans] = useState<SessionPlan[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  // Session Name Modal
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionName, setSessionName] = useState("");

  const [getMatchingPlans, { isLoading: isLoadingPlans }] =
    useGetMatchingPlansMutation();
  const [saveIntake, { isLoading: isSavingIntake }] = useSaveIntakeMutation();
  const [createSession, { isLoading: isCreatingSession }] =
    useCreateSessionMutation();
  const isSaving = isSavingIntake || isCreatingSession;

  const slidesData = [
    { id: "pain_assessment" },
    { id: "goal" },
    { id: "schedule" },
    { id: "plans" },
  ];

  const fetchPlansAndAdvance = async () => {
    try {
      const res = await getMatchingPlans({
        target_areas: selectedPainPoints,
        user_case: primaryGoal,
        session_duration: sessionDuration,
      }).unwrap();

      const items = res.items || [];
      setMatchingPlans(items);
      const allIds = items.map((p) => p.id || p.plan_id);
      setSelectedPlanIds(allIds);
    } catch (err) {
      console.error("Failed to load matching plans:", err);
      setMatchingPlans([]);
      setSelectedPlanIds([]);
    }

    const nextIndex = 3;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const handleNext = async () => {
    if (activeIndex === 0) {
      const nextIndex = 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else if (activeIndex === 1) {
      const nextIndex = 2;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else if (activeIndex === 2) {
      await fetchPlansAndAdvance();
    } else if (activeIndex === 3) {
      // Prompt session name modal
      setShowNameModal(true);
    }
  };

  const handleConfirmCreateSession = async () => {
    setShowNameModal(false);
    try {
      const session = await createSession({
        target_areas: selectedPainPoints,
        user_case: primaryGoal,
        session_name: sessionName.trim() || undefined,
        schedule_days: scheduleDays,
        schedule_weeks: scheduleWeeks,
        session_duration: sessionDuration,
        plan_ids: selectedPlanIds,
      }).unwrap();

      if (!session || !session.plans || session.plans.length === 0) {
        Alert.alert(
          "No Plans Found",
          "No movement plans are available for this configuration. Please adjust your target areas, goal, or session duration."
        );
        return;
      }

      try {
        await saveIntake({
          pain_points: selectedPainPoints,
          primary_goal: primaryGoal,
          schedule_days: scheduleDays,
          schedule_weeks: scheduleWeeks,
          session_duration: sessionDuration,
          session_name: sessionName.trim() || undefined,
        }).unwrap();
      } catch (intakeErr) {
        console.warn("Failed to update user intake record:", intakeErr);
      }

      router.dismissAll();
      router.navigate({
        pathname: "/sessions/session-details",
        params: { sessionId: session.id },
      });
    } catch (error: any) {
      console.error("Failed to create movement session", error);
      const errorDetail =
        error?.data?.detail || error?.error || error?.message;
      const isNoPlans =
        error?.status === 404 ||
        (typeof errorDetail === "string" &&
          (errorDetail.toLowerCase().includes("no plans") ||
            errorDetail.toLowerCase().includes("no movement plans")));

      Alert.alert(
        isNoPlans ? "No Plans Found" : "Error",
        typeof errorDetail === "string" && errorDetail
          ? errorDetail
          : "Failed to create your movement session. Please try again."
      );
    }
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      const prevIndex = activeIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setActiveIndex(prevIndex);
    } else {
      router.replace("/");
    }
  };

  const togglePainPoint = (label: string) => {
    if (selectedPainPoints.includes(label)) {
      setSelectedPainPoints((prev) => prev.filter((p) => p !== label));
    } else {
      setSelectedPainPoints((prev) => [...prev, label]);
    }
  };

  const togglePlanSelection = (planId: string) => {
    if (selectedPlanIds.includes(planId)) {
      setSelectedPlanIds((prev) => prev.filter((id) => id !== planId));
    } else {
      setSelectedPlanIds((prev) => [...prev, planId]);
    }
  };

  const selectAllPlans = () => {
    setSelectedPlanIds(matchingPlans.map((p) => p.id || p.plan_id));
  };

  const deselectAllPlans = () => {
    setSelectedPlanIds([]);
  };

  const handleAdjustConfigurations = () => {
    const targetIndex = 0;
    flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
    setActiveIndex(targetIndex);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Header
            showNotification={false}
            onBackPress={handleBack}
            hideShadow
          />

          {/* Top Header Wizard Navigation */}
          <View style={styles.headerBar}>
            <Text style={styles.progressLabel}>
              STEP {activeIndex + 1} OF {slidesData.length}
            </Text>

            <View style={styles.placeholder} />
          </View>

          {/* Dynamic Horizontal Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${((activeIndex + 1) / slidesData.length) * 100}%` },
              ]}
            />
          </View>

          <Svg height={8} width="100%" style={styles.shadowSvg}>
            <Defs>
              <LinearGradient id="shadow" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.text} stopOpacity={0.08} />
                <Stop offset="1" stopColor={theme.text} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height={8} fill="url(#shadow)" />
          </Svg>
        </View>

        {/* Paginated Intake Wizard Slides */}
        <FlatList
          ref={flatListRef}
          data={slidesData}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => {
            switch (item.id) {
              case "pain_assessment":
                return (
                  <PainAssessmentStep
                    userGender={userGender}
                    avatarView={avatarView}
                    setAvatarView={setAvatarView}
                    selectedPainPoints={selectedPainPoints}
                    togglePainPoint={togglePainPoint}
                    onNext={handleNext}
                  />
                );
              case "goal":
                return (
                  <GoalStep
                    primaryGoal={primaryGoal}
                    setPrimaryGoal={setPrimaryGoal}
                    onNext={handleNext}
                  />
                );
              case "schedule":
                return (
                  <ScheduleStep
                    scheduleDays={scheduleDays}
                    setScheduleDays={setScheduleDays}
                    scheduleWeeks={scheduleWeeks}
                    setScheduleWeeks={setScheduleWeeks}
                    sessionDuration={sessionDuration}
                    setSessionDuration={setSessionDuration}
                    onNext={handleNext}
                    onGoToHome={handleBack}
                    isSaving={isLoadingPlans}
                  />
                );
              case "plans":
                return (
                  <PlanSelectionStep
                    plans={matchingPlans}
                    selectedPlanIds={selectedPlanIds}
                    onTogglePlan={togglePlanSelection}
                    onSelectAll={selectAllPlans}
                    onDeselectAll={deselectAllPlans}
                    isLoading={isLoadingPlans}
                    onNext={handleNext}
                    onBack={handleBack}
                    onAdjustConfigurations={handleAdjustConfigurations}
                  />
                );
              default:
                return null;
            }
          }}
        />

        {/* Set Session Name Modal */}
        <Modal
          visible={showNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNameModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Name Your Session</Text>
              <Text style={styles.modalSubtitle}>
                Give your movement session a personalized name or save with default.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Morning Shoulder & Back"
                placeholderTextColor={themeState === "dark" ? "#5C6E84" : "#9CA3AF"}
                value={sessionName}
                onChangeText={setSessionName}
                autoFocus
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowNameModal(false)}
                  disabled={isSaving}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, isSaving && styles.modalSaveBtnDisabled]}
                  activeOpacity={0.8}
                  onPress={handleConfirmCreateSession}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>Create Session</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (
  theme: ReturnType<typeof useTheme>,
  themeState: ReturnType<typeof useThemeState>
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    headerContainer: {
      position: "relative",
      zIndex: 10,
    },
    shadowSvg: {
      position: "absolute",
      bottom: -8,
      left: 0,
      right: 0,
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 5,
      paddingBottom: 8,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.secondary,
      letterSpacing: 1.5,
    },
    placeholder: {
      width: 40,
    },
    progressTrack: {
      height: 4,
      backgroundColor: theme.cardBorder,
      borderRadius: 2,
      marginHorizontal: 24,
      marginBottom: 20,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: "#9EFAAF",
      borderRadius: 2,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    modalContent: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: themeState === "dark" ? "#1A2634" : theme.cardBackground,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: themeState === "dark" ? "#2B3C50" : theme.inputBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 6,
      textAlign: "center",
    },
    modalSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 18,
    },
    modalInput: {
      width: "100%",
      height: 52,
      backgroundColor: themeState === "dark" ? "#0F1620" : theme.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 15,
      color: theme.text,
      borderWidth: 1,
      borderColor: themeState === "dark" ? "#2B3C50" : theme.inputBorder,
      marginBottom: 24,
    },
    modalButtonsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    modalCancelBtn: {
      paddingVertical: 12,
      paddingHorizontal: 18,
    },
    modalCancelText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    modalSaveBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 140,
    },
    modalSaveBtnDisabled: {
      opacity: 0.6,
    },
    modalSaveText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });
