import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const goalOptions: GoalOption[] = [
  {
    id: "weak_unstable",
    title: "Feels Weak or Unstable",
    description: "Difficulty supporting weight or a sensation of 'giving way' during motion.",
    icon: "zap",
  },
  {
    id: "aches_discomfort",
    title: "Aches or Discomfort",
    description: "Generalized soreness or persistent low-level irritation after activity.",
    icon: "wind",
  },
  {
    id: "stiff_tight",
    title: "Stiff or Tight",
    description: "Restricted movement or persistent tension in joints or muscles.",
    icon: "user",
  },
  {
    id: "move_better",
    title: "Just Want to Move Better",
    description: "No specific pain, but looking to optimize mobility and athletic form.",
    icon: "heart",
  },
];

interface GoalStepProps {
  primaryGoal: string;
  setPrimaryGoal: (val: string) => void;
}

export function GoalStep({ primaryGoal, setPrimaryGoal }: GoalStepProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.slide}>
      <Text style={styles.title}>How does it feel?</Text>
      <Text style={styles.subtitle}>
        Identifying your sensory profile helps us calibrate recovery protocols
        and optimize your movement form based on clinical biomechanics.
      </Text>

      <View style={styles.optionsList}>
        {goalOptions.map((opt) => {
          const isSelected = primaryGoal === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, isSelected && styles.optionCardActive]}
              activeOpacity={0.8}
              onPress={() => setPrimaryGoal(opt.id)}
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
              {isSelected && (
                <Feather name="check-circle" size={18} color={theme.secondary} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
    checkIcon: {
      marginLeft: "auto",
    },
  });
