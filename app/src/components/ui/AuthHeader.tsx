import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import Svg, { Defs, Rect, LinearGradient, Stop } from 'react-native-svg';

interface AuthHeaderProps {
  onBackPress?: () => void;
  onHelpPress?: () => void;
  showShadow?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ 
  onBackPress, 
  onHelpPress,
  showShadow = false
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerBar}>
        {onBackPress ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBackPress}
            style={styles.headerButton}
          >
            <Feather name="arrow-left" size={22} color={theme.tertiary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderButton} />
        )}

        <Image
          source={require('@/assets/images/app/Body Axis™.png')}
          style={styles.headerLogo}
          contentFit="contain"
        />

        {onHelpPress ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onHelpPress}
            style={styles.headerButton}
          >
            <Feather name="help-circle" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderButton} />
        )}
      </View>
      {showShadow && (
        <Svg height={8} width="100%" style={styles.shadowSvg}>
          <Defs>
            <LinearGradient id="shadow" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.text} stopOpacity={0.08} />
              <Stop offset="1" stopColor={theme.text} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height={8} fill="url(#shadow)" />
        </Svg>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    headerWrapper: {
      position: 'relative',
      zIndex: 10,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      height: 56,
      backgroundColor: theme.background,
    },
    headerButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderButton: {
      width: 36,
      height: 36,
    },
    headerLogo: {
      width: 110,
      height: 22,
    },
    shadowSvg: {
      position: 'absolute',
      bottom: -8,
      left: 0,
      right: 0,
    },
  });

export default AuthHeader;
