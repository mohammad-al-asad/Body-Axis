import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, Rect, LinearGradient, Stop } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { useTheme } from '@/hooks/use-theme';
import { RootState } from '@/redux/store';

interface HeaderProps {
  onBellPress?: () => void;
  onAvatarPress?: () => void;
  onBackPress?: () => void;
  showNotification?: boolean;
  hideShadow?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onBellPress, 
  onAvatarPress, 
  onBackPress,
  showNotification = true,
  hideShadow = false
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const avatarUrl = useSelector((state: RootState) => state.auth.user?.avatar_url);

  // Calculate balancing widths to keep logo centered mathematically
  // Right side: Avatar (36) + gap (16) + Notification (36) = 88. Without notification = 36.
  const edgeWidth = showNotification ? 88 : 36;

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerRow}>
        <View style={{ width: edgeWidth, alignItems: 'flex-start', justifyContent: 'center' }}>
          {onBackPress && (
            <TouchableOpacity style={styles.backButton} onPress={onBackPress} activeOpacity={0.75}>
              <Feather name="arrow-left" size={24} color={theme.tertiary} />
            </TouchableOpacity>
          )}
        </View>
        
        <Image
          source={require('@/assets/images/app/Body Axis™.png')}
          style={styles.headerLogo}
          contentFit="contain"
        />
        
        <View style={[styles.headerRight, { width: edgeWidth, justifyContent: 'flex-end' }]}>
          {showNotification && (
            <TouchableOpacity style={styles.iconButton} onPress={onBellPress} activeOpacity={0.75}>
              <Feather name="bell" size={18} color={theme.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.75}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Feather name="user" size={17} color={theme.secondary} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {!hideShadow && (
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: theme.background,
    },
    shadowSvg: {
      position: 'absolute',
      bottom: -8,
      left: 0,
      right: 0,
    },
    headerLogo: {
      width: 110,
      height: 22,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    backButton: {
      padding: 4,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: theme.secondary,
    },
    avatarFallback: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: theme.secondary,
      backgroundColor: 'rgba(93, 230, 255, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
export default Header;
