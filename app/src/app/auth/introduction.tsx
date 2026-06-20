import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme, useThemeState } from '@/hooks/use-theme';

export default function IntroductionScreen() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  const handleBack = () => {
    router.replace('/');
  };

  const handleHelp = () => {
    Alert.alert(
      'Introduction Info',
      'This short overview explains how Body Axis™ analyzes your biomechanics to help you optimize movement efficiency and prevent injury.'
    );
  };

  const handleWatchIntroduction = () => {
    // Play video simulation or navigate directly to home
    router.replace('/');
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Body Axis™</Text>
          <TouchableOpacity onPress={handleHelp} style={styles.headerBtn} activeOpacity={0.7}>
            <Feather name="help-circle" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Welcome Title & Subtitle */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Body Axis™</Text>
            <Text style={styles.welcomeSubtitle}>
              Your transformation starts with understanding how your body moves. Let's begin.
            </Text>
          </View>

          {/* Video Preview Card */}
          <TouchableOpacity
            style={styles.videoCard}
            activeOpacity={0.9}
            onPress={handleWatchIntroduction}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
              }}
              style={styles.videoThumbnail}
            />
            {/* Play Button Overlay */}
            <View style={styles.playButtonWrapper}>
              <View style={styles.playButtonInner}>
                <Feather name="play" size={22} color="#FFFFFF" style={{ marginLeft: 3 }} />
              </View>
            </View>
            {/* Duration Badge */}
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>3:45</Text>
            </View>
          </TouchableOpacity>

          {/* Message Card from Christina */}
          <View style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={styles.messageDot} />
              <Text style={styles.messageLabel}>MESSAGE FROM CHRISTINA</Text>
            </View>
            <Text style={styles.messageTitle}>Precision in every movement.</Text>
            <Text style={styles.messageQuote}>
              "I built Body Axis™ to bridge the gap between hard work and scientific mobility. We don't just track reps; we track how your joints interact with the world."
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.watchBtn}
              activeOpacity={0.8}
              onPress={handleWatchIntroduction}
            >
              <Text style={styles.watchBtnText}>Watch Introduction</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              activeOpacity={0.8}
              onPress={handleSkip}
            >
              <Text style={styles.skipBtnText}>Skip For Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      height: 56,
      borderBottomWidth: 1,
      borderBottomColor: themeState === 'dark' ? '#111827' : 'rgba(0, 0, 0, 0.05)',
    },
    headerBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: -0.5,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
    },
    welcomeContainer: {
      marginBottom: 24,
    },
    welcomeTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.8,
      marginBottom: 8,
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    videoCard: {
      width: '100%',
      height: 200,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: 24,
      backgroundColor: '#1E2633',
    },
    videoThumbnail: {
      width: '100%',
      height: '100%',
      opacity: 0.85,
    },
    playButtonWrapper: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButtonInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    durationBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    durationText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    messageCard: {
      backgroundColor: themeState === 'dark' ? '#111827' : theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: themeState === 'dark' ? '#1E2B40' : theme.inputBorder,
      padding: 20,
      marginBottom: 32,
    },
    messageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    messageDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.secondary,
      marginRight: 8,
    },
    messageLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 1,
    },
    messageTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 10,
    },
    messageQuote: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    actionsContainer: {
      gap: 12,
    },
    watchBtn: {
      width: '100%',
      height: 54,
      borderRadius: 14,
      backgroundColor: theme.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    watchBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    skipBtn: {
      width: '100%',
      height: 54,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: themeState === 'dark' ? '#2A3649' : theme.inputBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    skipBtnText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
    },
  });
