import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { CustomSwitch } from '@/components/ui/CustomSwitch';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  // Toggle switch states
  const [settings, setSettings] = useState({
    mobilityReminders: true,
    learningUpdates: false,
    emailNotifications: true,
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
          <Text style={styles.title}>Notification settings</Text>
          <Text style={styles.subtitle}>Manage reminders and wellness alerts</Text>

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
