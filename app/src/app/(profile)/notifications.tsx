import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { CustomSwitch } from '@/components/ui/CustomSwitch';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  // Toggle switch states
  const [settings, setSettings] = useState({
    workoutReminders: true,
    mobilityReminders: true,
    assessmentReminders: false,
    progressAlerts: true,
    learningUpdates: false,
    emailNotifications: true,
    subscriptionNotifications: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onBackPress={() => router.back()} showNotification={true} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Manage reminders and wellness alerts</Text>

          {/* Section: Wellness Reminders */}
          <Text style={styles.sectionHeader}>WELLNESS REMINDERS</Text>

          {/* Workout Reminders */}
          <View style={styles.cardItem}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="dumbbell" size={20} color={theme.text} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Workout reminders</Text>
              <Text style={styles.itemSubtitle}>Stay on track with schedule</Text>
            </View>
            <CustomSwitch
              value={settings.workoutReminders}
              onValueChange={() => toggleSetting('workoutReminders')}
            />
          </View>

          {/* Daily Mobility Reminders */}
          <View style={styles.cardItem}>
            <View style={styles.iconBox}>
              <Ionicons name="accessibility-outline" size={20} color={theme.text} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Daily mobility reminders</Text>
              <Text style={styles.itemSubtitle}>Preventative stretch alerts</Text>
            </View>
            <CustomSwitch
              value={settings.mobilityReminders}
              onValueChange={() => toggleSetting('mobilityReminders')}
            />
          </View>

          {/* Assessment Reminders */}
          <View style={styles.cardItem}>
            <View style={styles.iconBox}>
              <Feather name="bar-chart-2" size={18} color={theme.text} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Assessment reminders</Text>
              <Text style={styles.itemSubtitle}>Bi-weekly body scans</Text>
            </View>
            <CustomSwitch
              value={settings.assessmentReminders}
              onValueChange={() => toggleSetting('assessmentReminders')}
            />
          </View>

          {/* Section: Program Updates */}
          <Text style={styles.sectionHeader}>PROGRAM UPDATES</Text>

          {/* Program Progress Alerts */}
          <View style={styles.cardItem}>
            <View style={styles.iconBox}>
              <Feather name="trending-up" size={18} color={theme.text} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Program progress alerts</Text>
              <Text style={styles.itemSubtitle}>Milestones and level ups</Text>
            </View>
            <CustomSwitch
              value={settings.progressAlerts}
              onValueChange={() => toggleSetting('progressAlerts')}
            />
          </View>

          {/* Learning Content Updates */}
          <View style={styles.cardItem}>
            <View style={styles.iconBox}>
              <Ionicons name="school-outline" size={18} color={theme.text} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Learning content updates</Text>
              <Text style={styles.itemSubtitle}>New science-based articles</Text>
            </View>
            <CustomSwitch
              value={settings.learningUpdates}
              onValueChange={() => toggleSetting('learningUpdates')}
            />
          </View>

          {/* Section: Communication Channels */}
          <Text style={styles.sectionHeader}>COMMUNICATION CHANNELS</Text>

          {/* Email Notifications */}
          <View style={styles.cardItem}>
            <View style={styles.iconBox}>
              <Feather name="mail" size={18} color={theme.text} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Email notifications</Text>
            </View>
            <CustomSwitch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
            />
          </View>

          {/* Subscription Notifications */}
          <View style={styles.cardItem}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="credit-card-outline" size={18} color={theme.text} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Subscription notifications</Text>
            </View>
            <CustomSwitch
              value={settings.subscriptionNotifications}
              onValueChange={() => toggleSetting('subscriptionNotifications')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginTop: 12,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 24,
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 1.0,
      marginTop: 16,
      marginBottom: 12,
    },
    cardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 12,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    itemSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 3,
    },
  });
