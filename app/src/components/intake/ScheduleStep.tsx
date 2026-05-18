import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/hooks/use-theme";
import { CustomSlider } from "@/components/ui/CustomSlider";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface ScheduleStepProps {
  scheduleDays: number;
  setScheduleDays: (val: number) => void;
  scheduleWeeks: number;
  setScheduleWeeks: (val: number) => void;
  sessionDuration: number;
  setSessionDuration: (val: number) => void;
}

export function ScheduleStep({
  scheduleDays,
  setScheduleDays,
  scheduleWeeks,
  setScheduleWeeks,
  sessionDuration,
  setSessionDuration,
}: ScheduleStepProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const efficiency = Math.round(((scheduleDays * sessionDuration) / 180) * 98);

  return (
    <View style={styles.slide}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Your Movement Schedule</Text>
        <Text style={styles.subtitle}>
          Pick what works for your life and we&apos;ll build around it.
        </Text>
        <CustomSlider
          label="Days per week"
          value={scheduleDays}
          min={2}
          max={4}
          onValueChange={setScheduleDays}
        />

        <CustomSlider
          label="Total Weeks"
          value={scheduleWeeks}
          min={2}
          max={4}
          onValueChange={setScheduleWeeks}
          activeColor="#A4C9FF"
        />

        <View style={styles.durationContainer}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 10,
                color: theme.secondary,
                fontWeight: "800",
                marginRight: 8,
                letterSpacing: 1,
              }}
            >
              TIME
            </Text>
            <Text style={{ fontSize: 13, color: theme.text, fontWeight: "600" }}>
              Session Duration
            </Text>
          </View>

          <View style={styles.durationOptions}>
            {[15, 30, 45].map((dur) => {
              const isSelected = sessionDuration === dur;
              return (
                <TouchableOpacity
                  key={dur}
                  onPress={() => setSessionDuration(dur)}
                  style={[
                    styles.durationBtn,
                    isSelected && {
                      backgroundColor: theme.secondary,
                      borderColor: theme.secondary,
                    },
                  ]}
                >
                  <Text
                    style={[styles.durationVal, isSelected && { color: theme.backgroundElement }]}
                  >
                    {dur}
                  </Text>
                  <Text
                    style={[styles.durationLabel, isSelected && { color: theme.backgroundElement }]}
                  >
                    MIN
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.efficiencyCard}>
          <View style={styles.ringContainer}>
            <Svg width={140} height={140} viewBox="0 0 140 140">
              <Circle cx="70" cy="70" r="60" stroke={theme.cardBorder} strokeWidth="10" fill="none" />
              <Circle
                cx="70"
                cy="70"
                r="60"
                stroke={theme.secondary}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - efficiency / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </Svg>
            <View style={styles.ringContent}>
              <Text style={styles.ringValue}>{efficiency}%</Text>
              <Text style={styles.ringLabel}>EFFICIENCY</Text>
            </View>
          </View>
          <Text style={styles.efficiencyDesc}>
            Projected recovery velocity based on current selection.
          </Text>
        </View>

        <View style={styles.paceCard}>
          <Text style={styles.paceTitle}>OPTIMAL MOVEMENT PACE</Text>
          <Text style={styles.paceDesc}>
            Based on your goals,{" "}
            <Text style={styles.paceHighlight}>
              {scheduleDays} sessions of {sessionDuration} mins
            </Text>{" "}
            provides the peak cognitive recovery ratio.
          </Text>
        </View>
      </ScrollView>
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
      marginBottom: 16,
    },
    durationContainer: {
      marginBottom: 20,
    },
    durationOptions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    durationBtn: {
      flex: 1,
      height: 70,
      backgroundColor: "rgba(17, 24, 39, 0.4)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    durationVal: {
      fontSize: 20,
      fontWeight: "700",
      color: "#F9FAFB",
      marginBottom: 4,
    },
    durationLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: "#9CA3AF",
    },
    efficiencyCard: {
      backgroundColor: "rgba(17, 24, 39, 0.4)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 20,
      padding: 30,
      alignItems: "center",
      marginBottom: 20,
    },
    ringContainer: {
      width: 140,
      height: 140,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    ringContent: {
      position: "absolute",
      alignItems: "center",
    },
    ringValue: {
      fontSize: 32,
      fontWeight: "800",
      color: "#F9FAFB",
    },
    ringLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: "#5DE6FF",
      letterSpacing: 1,
    },
    efficiencyDesc: {
      fontSize: 13,
      color: "#9CA3AF",
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 20,
    },
    paceCard: {
      backgroundColor: "rgba(17, 24, 39, 0.4)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
      borderLeftWidth: 3,
      borderLeftColor: "#5DE6FF",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    paceTitle: {
      fontSize: 11,
      fontWeight: "800",
      color: "#5DE6FF",
      letterSpacing: 1,
      marginBottom: 10,
    },
    paceDesc: {
      fontSize: 13,
      color: "#D1D5DB",
      lineHeight: 20,
    },
    paceHighlight: {
      color: "#5DE6FF",
      fontWeight: "700",
    },
  });
