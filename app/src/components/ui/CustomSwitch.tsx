import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: () => void;
  style?: ViewStyle;
}

export function CustomSwitch({ value, onValueChange, style }: CustomSwitchProps) {
  const theme = useTheme();
  const activeColor = theme.quaternary || theme.secondary;
  const inactiveColor = "#334155";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onValueChange}
      style={[
        styles.switchTrack,
        { backgroundColor: value ? activeColor : inactiveColor },
        style,
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          value ? styles.switchThumbActive : styles.switchThumbInactive,
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switchTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.22,
    shadowRadius: 1.8,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },
});
