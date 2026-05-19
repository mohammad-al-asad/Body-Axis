import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';

export default function PrivacyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onBackPress={() => router.back()} showNotification={false} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.subtitle}>Last updated: May 19, 2026</Text>

          <View style={styles.card}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Data Collection</Text>
              <Text style={styles.bodyText}>
                We collect biomechanical alignment measurements, calibration logs, and health statistics to personalize your therapeutic training routines. This data is processed securely on your local device.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Use of Information</Text>
              <Text style={styles.bodyText}>
                Your information is strictly utilized to generate personalized protocols, track recovery progress, and evaluate joint mechanics. We do not sell or lease your personal biometric data.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Storage & Security</Text>
              <Text style={styles.bodyText}>
                All local configuration and session state data are encrypted. Backend synchronized data is sent over encrypted HTTPS connections and stored using standardized secure server layers.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Contact Us</Text>
              <Text style={styles.bodyText}>
                If you have any questions or feedback regarding our privacy standards, feel free to contact our compliance team at support@bodyaxis.com.
              </Text>
            </View>
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
      paddingHorizontal: 15,
      paddingBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginTop: 12,
      marginBottom: 4,
      marginLeft: 10,
      letterSpacing: -0.5,
    },
    subtitle: {
      marginLeft: 10,
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 24,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      paddingHorizontal: 20,
      marginBottom: 16,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    section: {
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.quaternary || theme.secondary,
      marginBottom: 10,
    },
    bodyText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
    },
  });
