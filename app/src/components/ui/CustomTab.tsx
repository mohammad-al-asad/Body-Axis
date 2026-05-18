import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export interface TabOption<T> {
  value: T;
  label: string;
}

interface CustomTabProps<T> {
  options: TabOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  style?: ViewStyle;
}

export function CustomTab<T>({
  options,
  selectedValue,
  onSelect,
  style,
}: CustomTabProps<T>) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.toggleTrack, style]}>
      {options.map((option) => {
        const isActive = selectedValue === option.value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            style={[styles.toggleOption, isActive && styles.toggleOptionActive]}
            activeOpacity={0.9}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    toggleTrack: {
      flexDirection: 'row',
      backgroundColor: theme.inputBackground,
      borderRadius: 24,
      padding: 4,
      height: 48,
    },
    toggleOption: {
      flex: 1,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleOptionActive: {
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 2,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    toggleTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
