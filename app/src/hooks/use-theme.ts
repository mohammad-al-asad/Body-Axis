import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const Colors = {
  light: {
    primary: "#3B82F6",
    secondary: "#44E2CD",
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    cardBackground: "#F0F0F3",
    cardBorder: "transparent",
    inputBackground: "#E0E1E6",
    inputBorder: "#D0D1D6",
    grayBorder: "#1118271A", // Light equivalent
    error: "#FF6B6B",
    tertiary: "#ADC6FF",
    quaternary: "#62FAE3",
  },
  dark: {
    primary: "#3B82F6",
    secondary: "#5DE6FF",
    text: "#ffffff",
    background: "#050B14",
    backgroundElement: "#0E1420",
    backgroundSelected: "#1C2B42",
    textSecondary: "#5C6E84",
    cardBackground: "#111827",
    cardBorder: "#22D3EE4D",
    inputBackground: "#010F1F",
    inputBorder: "#1A2538",
    grayBorder: "#111827",
    error: "#FF6B6B",
    tertiary: "#ADC6FF",
    quaternary: "#62FAE3",
  },
} as const;

export function useTheme() {
  const theme = useSelector((state: RootState) => state.settings.theme);

  return Colors[theme];
}
