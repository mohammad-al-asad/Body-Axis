import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { CustomButton } from "@/components/ui/CustomButton";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const goalOptions: GoalOption[] = [
  {
    id: "stiff_tight",
    title: "Move More Freely",
    description: "Improve mobility and feel less restricted.",
    icon: "bandage",
  },
  {
    id: "aches_discomfort",
    title: "Ease Everyday Soreness",
    description: "Gentle movement for mild, general soreness.",
    icon: "human",
  },
  {
    id: "weak_unstable",
    title: "Build Strength & Control",
    description: "Improve stability, coordination, and movement confidence.",
    icon: "human-capacity-decrease",
  },
  {
    id: "move_better",
    title: "Improve Performance",
    description: "Support better movement for exercise, sports, and daily activities.",
    icon: "run",
  },
];

interface GoalStepProps {
  primaryGoal: string;
  setPrimaryGoal: (val: string) => void;
  onNext: () => void;
}

export function GoalStep({ primaryGoal, setPrimaryGoal, onNext }: GoalStepProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.slide}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, marginTop: 24 }}>
        <Text style={styles.title}>Choose Your Movement Goal</Text>
        <Text style={styles.subtitle}>
          {"Select what you'd like to focus on today."}
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
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={22}
                    color={isSelected ? theme.secondary : theme.textSecondary}
                  />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>
                    {opt.title}
                  </Text>
                  <Text style={styles.cardSubtitle}>{opt.description}</Text>
                </View>
                <View style={[styles.radioButton, isSelected && styles.radioButtonActive]}>
                  {isSelected && <View style={styles.radioButtonDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

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

        {/* Footer inside scroll */}
        <View style={styles.footer}>
          <CustomButton
            title="Continue"
            onPress={onNext}
            disabled={!primaryGoal}
            style={styles.actionBtn}
          />
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
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    optionCardActive: {
      borderColor: theme.secondary,
      backgroundColor: theme.backgroundSelected === "#E0E1E6" ? "#050B14" : theme.backgroundSelected,

      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
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
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.textSecondary,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: "auto",
    },
    radioButtonActive: {
      borderColor: theme.secondary,
    },
    radioButtonDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.secondary,
    },
    footer: {
      paddingTop: 24,
      paddingBottom: 24,
    },
    actionBtn: {
      width: "100%",
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
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
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
