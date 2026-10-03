import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, useThemeState } from '@/hooks/use-theme';
import { CustomSheet } from '@/components/ui/CustomSheet';

interface UpdateModalProps {
  visible: boolean;
  isForceUpdate: boolean;
  title: string;
  message: string;
  url: string;
  currentVersion: string;
  latestVersion: string;
  onDismiss: () => void;
}

export function UpdateModal({
  visible,
  isForceUpdate,
  title,
  message,
  url,
  currentVersion,
  latestVersion,
  onDismiss,
}: UpdateModalProps) {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  const handleUpdatePress = async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.error('Failed to open update URL:', err);
      Alert.alert('Error', 'Unable to open the store link. Please try again later.');
    }
  };

  return (
    <CustomSheet
      visible={visible}
      onClose={onDismiss}
      canDismiss={!isForceUpdate}
    >
      <View style={styles.sheetContainer}>
        {/* Icon Badge */}
        <View style={styles.iconCircle}>
          <Feather name="arrow-up-circle" size={32} color={theme.secondary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Version Comparison Badge */}
        <View style={styles.versionBadgeRow}>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeLabel}>Current</Text>
            <Text style={styles.versionBadgeValue}>v{currentVersion}</Text>
          </View>
          <Feather name="arrow-right" size={14} color={theme.textSecondary} style={{ marginHorizontal: 8 }} />
          <View style={[styles.versionBadge, styles.versionBadgeNew]}>
            <Text style={[styles.versionBadgeLabel, { color: theme.secondary }]}>New</Text>
            <Text style={[styles.versionBadgeValue, { color: theme.secondary }]}>v{latestVersion}</Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.updateButton}
          activeOpacity={0.8}
          onPress={handleUpdatePress}
        >
          <Text style={styles.updateButtonText}>Update Now</Text>
          <Feather name="external-link" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Optional Later Button (Hidden on Force Update) */}
        {!isForceUpdate && (
          <TouchableOpacity
            style={styles.laterButton}
            activeOpacity={0.7}
            onPress={onDismiss}
          >
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        )}
      </View>
    </CustomSheet>
  );
}

const createStyles = (
  theme: ReturnType<typeof useTheme>,
  themeState: ReturnType<typeof useThemeState>
) =>
  StyleSheet.create({
    sheetContainer: {
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 16,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: themeState === 'dark' ? '#0F1E2E' : '#EAFBFF',
      borderWidth: 1,
      borderColor: themeState === 'dark' ? 'rgba(93, 230, 255, 0.25)' : '#A5F3FC',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 26,
    },
    versionBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    versionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeState === 'dark' ? '#091018' : '#F1F5F9',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    versionBadgeNew: {
      backgroundColor: themeState === 'dark' ? '#08212D' : '#ECFEFF',
      borderColor: themeState === 'dark' ? 'rgba(93, 230, 255, 0.4)' : '#67E8F9',
    },
    versionBadgeLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      marginRight: 4,
    },
    versionBadgeValue: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },
    message: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    updateButton: {
      backgroundColor: theme.primary,
      width: '100%',
      paddingVertical: 14,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    updateButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    laterButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginTop: 8,
    },
    laterButtonText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
