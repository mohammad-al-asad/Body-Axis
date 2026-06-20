import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';

export default function TermsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onBackPress={() => router.back()} showNotification={false} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.subtitle}>Last updated: May 19, 2026</Text>

          <View style={styles.card}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
              <Text style={styles.bodyText}>
                By downloading, browsing, or utilizing the Body Axis™ mobile application, you agree to comply with and be bound by these Terms of Service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Biometric Data Disclaimer</Text>
              <Text style={styles.bodyText}>
                The calibration metrics and physical routines presented in this app are designed for educational and fitness enhancement purposes. They do not constitute formal medical diagnosis or advice.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.bodyText}>
                You are responsible for maintaining the privacy of your account credentials. Any activities that take place under your active profile remain your sole responsibility.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Subscriptions & Payments</Text>
              <Text style={styles.bodyText}>
                Pro subscriptions renew automatically unless turned off in your app store account settings at least 24 hours prior to the conclusion of the active subscription period.
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
