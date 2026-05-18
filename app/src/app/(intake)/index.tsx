import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { RootState } from "@/redux/store";
import { useTheme } from "@/hooks/use-theme";
import { CustomButton } from "@/components/ui/CustomButton";
import { Header } from "@/components/Header";

import { ImproveStep } from "@/components/intake/ImproveStep";
import { PainAssessmentStep } from "@/components/intake/PainAssessmentStep";
import { GoalStep } from "@/components/intake/GoalStep";
import { ScheduleStep } from "@/components/intake/ScheduleStep";

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
  const [improveGoal, setImproveGoal] = useState<string>("reduce_pain");
  const [avatarView, setAvatarView] = useState<"front" | "back">("front");
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<string>("");
  
  // Schedule Step
  const [scheduleDays, setScheduleDays] = useState<number>(3);
  const [scheduleWeeks, setScheduleWeeks] = useState<number>(3);
  const [sessionDuration, setSessionDuration] = useState<number>(45);

  const handleNext = () => {
    if (activeIndex < slidesData.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else {
      router.replace("/(auth)/premium");
    }
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      const prevIndex = activeIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setActiveIndex(prevIndex);
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
    if (activeIndex === 0 && !improveGoal) return true;
    if (activeIndex === 1 && selectedPainPoints.length === 0) return true;
    if (activeIndex === 2 && !primaryGoal) return true;
    // Step 3 (schedule) requires no validation as it has defaults
    return false;
  };

  const slidesData = [
    { id: "improve" },
    { id: "pain_assessment" },
    { id: "goal" },
    { id: "schedule" },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        <Header 
          showNotification={false}
          onBackPress={activeIndex > 0 ? handleBack : undefined}
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
              case "improve":
                return <ImproveStep improveGoal={improveGoal} setImproveGoal={setImproveGoal} />;
              case "pain_assessment":
                return (
                  <PainAssessmentStep
                    userGender={userGender}
                    avatarView={avatarView}
                    setAvatarView={setAvatarView}
                    selectedPainPoints={selectedPainPoints}
                    togglePainPoint={togglePainPoint}
                  />
                );
              case "goal":
                return <GoalStep primaryGoal={primaryGoal} setPrimaryGoal={setPrimaryGoal} />;
              case "schedule":
                return (
                  <ScheduleStep
                    scheduleDays={scheduleDays}
                    setScheduleDays={setScheduleDays}
                    scheduleWeeks={scheduleWeeks}
                    setScheduleWeeks={setScheduleWeeks}
                    sessionDuration={sessionDuration}
                    setSessionDuration={setSessionDuration}
                  />
                );
              default:
                return null;
            }
          }}
        />

        {/* Global Bottom Footer Navigation */}
        <View style={styles.footer}>
          <CustomButton
            title={
              activeIndex === slidesData.length - 1
                ? "See My Movement Plans"
                : "Continue"
            }
            onPress={handleNext}
            disabled={isNextDisabled()}
            style={styles.actionBtn}
          />
        </View>
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
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 12,
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
