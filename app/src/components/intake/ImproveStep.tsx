import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface ImproveOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const improveOptions: ImproveOption[] = [
  {
    id: "reduce_pain",
    title: "Reduce Pain",
    description: "Targeted relief for chronic discomfort.",
    icon: "activity",
  },
  {
    id: "move_freely",
    title: "Move More Freely",
    description: "Restore movement & reduce tension",
    icon: "user",
  },
  {
    id: "feel_stronger",
    title: "Feel Stronger & Stable",
    description: "Build strength & control",
    icon: "zap",
  },
  {
    id: "move_better_daily",
    title: "Move Better Daily",
    description: "Improve how your body feels & functions",
    icon: "compass",
  },
  {
    id: "improve_recovery",
    title: "Improve Recovery",
    description: "Accelerate healing post-exertion.",
    icon: "sun",
  },
];

interface ImproveStepProps {
  improveGoal: string;
  setImproveGoal: (val: string) => void;
}

export function ImproveStep({ improveGoal, setImproveGoal }: ImproveStepProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.slide}>
      <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What would you like to improve?</Text>
        <Text style={styles.subtitle}>
          Select the primary focus for your corrective exercise journey.
        </Text>
        {improveOptions.map((opt) => {
          const isSelected = improveGoal === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, isSelected && styles.optionCardActive]}
              activeOpacity={0.8}
              onPress={() => setImproveGoal(opt.id)}
            >
              <View style={[styles.iconContainer, isSelected && styles.iconContainerActive]}>
                <Feather
                  name={opt.icon}
                  size={18}
                  color={isSelected ? theme.secondary : theme.textSecondary}
                />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>
                  {opt.title}
                </Text>
                <Text style={styles.cardSubtitle}>{opt.description}</Text>
              </View>

              <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoCard}>
          <Feather name="info" size={16} color={theme.secondary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            These protocols are designed for general movement improvement and are
            not a substitute for medical advice. If you are experiencing sharp,
            shooting, or severe pain, numbness, tingling, or have a recent
            injury or diagnosis, please consult a healthcare professional before
            starting. This app is not intended to treat or diagnose any medical
            condition.
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
    optionsList: {
      flex: 1,
    },
    optionCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 0.5,
      borderColor: "transparent",
      borderRadius: 14,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    optionCardActive: {
      borderColor: theme.secondary,
      backgroundColor: theme.backgroundSelected,
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.backgroundSelected,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    iconContainerActive: {
      backgroundColor: theme.textSecondary === "#5C6E84" ? "#0A2533" : "#E0F7FA",
    },
    cardTextContainer: {
      flex: 1,
      paddingRight: 8,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    cardTitleActive: {
      color: theme.secondary,
    },
    cardSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.cardBorder,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    radioOuterActive: {
      borderColor: theme.secondary,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.secondary,
    },
    infoCard: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 18,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 12,
      marginBottom: 16,
    },
    infoIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      fontSize: 11,
      color: theme.textSecondary,
      lineHeight: 16,
    },
  });
