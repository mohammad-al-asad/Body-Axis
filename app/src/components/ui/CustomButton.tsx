import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconSize?: number;
}

export function CustomButton({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconSize = 20,
}: CustomButtonProps) {
  const isBtnDisabled = disabled || isLoading;
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme.primary, shadowColor: theme.primary },
        isBtnDisabled && styles.buttonDisabled,
        style,
      ]}
      activeOpacity={0.85}
      disabled={isBtnDisabled}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          {icon ? (
            icon
          ) : (
            <AntDesign
              name="arrow-right"
              size={iconSize}
              color="#FFFFFF"
              style={styles.icon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2F80ED',
    borderRadius: 12,
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#2F80ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  icon: {
    marginLeft: 6,
    alignSelf: 'center',
  },
});
