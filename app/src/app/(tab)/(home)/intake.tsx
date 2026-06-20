import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { RootState } from "@/redux/store";
import { useTheme } from "@/hooks/use-theme";
import { useSaveIntakeMutation } from "@/redux/api/userApi";
import { Header } from "@/components/Header";
import { PainAssessmentStep } from "@/components/intake/PainAssessmentStep";
import { GoalStep } from "@/components/intake/GoalStep";
import { ScheduleStep } from "@/components/intake/ScheduleStep";
import Svg, { Defs, Rect, LinearGradient, Stop } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function IntakeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

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

  const [saveIntake, { isLoading: isSaving }] = useSaveIntakeMutation();

  const handleNext = async () => {
    if (activeIndex < slidesData.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else {
      try {
        await saveIntake({
          pain_points: selectedPainPoints,
          primary_goal: primaryGoal,
          schedule_days: scheduleDays,
          schedule_weeks: scheduleWeeks,
          session_duration: sessionDuration,
        }).unwrap();
        router.replace("/");
      } catch (error) {
        console.error("Failed to save intake data", error);
        Alert.alert("Error", "Failed to save your intake data. Please try again.");
      }
    }
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      const prevIndex = activeIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setActiveIndex(prevIndex);
    }else{
      router.replace('/')
    }
  };

  const togglePainPoint = (label: string) => {
    if (selectedPainPoints.includes(label)) {
      setSelectedPainPoints((prev) => prev.filter((p) => p !== label));
    } else {
      setSelectedPainPoints((prev) => [...prev, label]);
    }
  };

  const isNextDisabled = () => {
    if (activeIndex === 0 && selectedPainPoints.length === 0) return true;
    if (activeIndex === 1 && !primaryGoal) return true;
    // Step 2 (schedule) requires no validation as it has defaults
    return false;
  };

  const slidesData = [
    { id: "pain_assessment" },
    { id: "goal" },
    { id: "schedule" },
  ];

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
                return <GoalStep primaryGoal={primaryGoal} setPrimaryGoal={setPrimaryGoal} onNext={handleNext} />;
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
                    isSaving={isSaving}
                  />
                );
              default:
                return null;
            }
          }}
        />
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
    headerContainer: {
      position: 'relative',
      zIndex: 10,
    },
    shadowSvg: {
      position: 'absolute',
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
    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 20,
      backgroundColor: theme.background,
    },
    actionBtn: {
      width: "100%",
    },
    backFooterBtn: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      marginTop: 8,
    },
    backFooterText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.textSecondary,
    },
  });
