import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  onBellPress?: () => void;
  onAvatarPress?: () => void;
  onBackPress?: () => void;
  showNotification?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onBellPress, 
  onAvatarPress, 
  onBackPress,
  showNotification = true 
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Calculate balancing widths to keep logo centered mathematically
  // Right side: Avatar (36) + gap (16) + Notification (36) = 88. Without notification = 36.
  const edgeWidth = showNotification ? 88 : 36;

  return (
    <View style={styles.headerRow}>
      <View style={{ width: edgeWidth, alignItems: 'flex-start', justifyContent: 'center' }}>
        {onBackPress && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress} activeOpacity={0.75}>
            <Feather name="arrow-left" size={24} color={theme.text} />
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
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 16,
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
  });
export default Header;
