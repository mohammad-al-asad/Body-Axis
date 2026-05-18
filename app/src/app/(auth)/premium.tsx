import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomTab } from '@/components/ui/CustomTab';

export default function PremiumScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Selector state: 'monthly' | 'yearly'
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleStartJourney = () => {
    Alert.alert(
      'Welcome to Premium!',
      `You have successfully subscribed to the Axis ${
        billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'
      } plan.`,
      [
        {
          text: 'Get Started',
          onPress: () => {
            router.replace('/(intake)');
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    router.replace('/(tab)');
  };

  const handleHelp = () => {
    Alert.alert('Subscription Info', 'Axis Premium gives you full, unrestricted access to all corrective routines, biological calibration protocols, and AI movement analytics.');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Paywall Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleSkip} activeOpacity={0.75}>
            <Feather name="arrow-left" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <Image
            source={require('@/assets/images/app/Body Axis™.png')}
            style={styles.logoImage}
            contentFit="contain"
          />

          <TouchableOpacity style={styles.helpButton} onPress={handleHelp} activeOpacity={0.75}>
            <Feather name="help-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Titles */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              Axis <Text style={styles.highlightTitle}>Premium</Text>
            </Text>
            <Text style={styles.subtitle}>
              One plan. Unlimited performance.{"\n"}Unlock every protocol in our library.
            </Text>
          </View>

          {/* Pricing Card Container */}
          <View style={styles.pricingCard}>
            {/* Toggle Switch */}
            <CustomTab
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              selectedValue={billingPeriod}
              onSelect={setBillingPeriod}
              style={{ marginBottom: 24 }}
            />

            {/* Price Display */}
            <View style={styles.priceContainer}>
              <Text style={styles.accessLabel}>
                {billingPeriod === 'monthly' ? 'MONTHLY ACCESS' : 'ANNUAL ACCESS'}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>
                  {billingPeriod === 'monthly' ? '$29.99' : '$19.99'}
                </Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
            </View>

            {/* Premium Features List */}
            <View style={styles.featuresList}>
              {/* Feature 1 */}
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Feather name="check-circle" size={16} color={theme.secondary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Unlimited Protocol Access</Text>
                  <Text style={styles.featureSubtitle}>Full library of corrective exercises.</Text>
                </View>
              </View>

              {/* Feature 2 */}
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Feather name="bar-chart-2" size={16} color={theme.secondary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Advanced Biomechanical Data</Text>
                  <Text style={styles.featureSubtitle}>Real-time alignment analysis.</Text>
                </View>
              </View>

              {/* Feature 3 */}
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Feather name="zap" size={16} color={theme.secondary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Elite Coaching Insights</Text>
                  <Text style={styles.featureSubtitle}>Personalized professional feedback.</Text>
                </View>
              </View>

              {/* Feature 4 */}
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Feather name="refresh-cw" size={16} color={theme.secondary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Cross-Device Sync</Text>
                  <Text style={styles.featureSubtitle}>Access on any platform.</Text>
                </View>
              </View>
            </View>

            {/* Action CTA Button */}
            <CustomButton
              title="Start Your Journey"
              onPress={handleStartJourney}
              style={styles.ctaButton}
            />

            <Text style={styles.cancelAnytimeLabel}>CANCEL ANYTIME</Text>
          </View>

          {/* Bottom Dual Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.gridCard}>
              <Feather name="zap" size={18} color={theme.secondary} style={styles.gridIcon} />
              <Text style={styles.gridTitle}>Instant Unlock</Text>
              <Text style={styles.gridSubtitle}>500+ premium sessions.</Text>
            </View>

            <View style={styles.gridCard}>
              <Feather name="shield" size={18} color={theme.secondary} style={styles.gridIcon} />
              <Text style={styles.gridTitle}>Secure Axis</Text>
              <Text style={styles.gridSubtitle}>Biometric encryption.</Text>
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
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    logoImage: {
      width: 100,
      height: 20,
    },
    helpButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    scrollContent: {
      paddingBottom: 32,
    },
    titleContainer: {
      alignItems: 'center',
      paddingHorizontal: 24,
      marginTop: 12,
      marginBottom: 24,
    },
    mainTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.8,
      marginBottom: 8,
      textAlign: 'center',
    },
    highlightTitle: {
      color: theme.secondary,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    pricingCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      marginHorizontal: 24,
      padding: 24,
      shadowColor: '#3B82F61A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
      marginBottom: 24,
    },
    priceContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    accessLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 1.0,
      marginBottom: 8,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    priceAmount: {
      fontSize: 48,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: -1,
    },
    pricePeriod: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '600',
      marginLeft: 4,
    },
    billingAnnuallyLabel: {
      fontSize: 11,
      color: theme.secondary,
      fontWeight: '600',
      marginTop: 4,
    },
    featuresList: {
      gap: 16,
      marginBottom: 28,
      borderTopWidth: 1,
      borderTopColor: theme.inputBorder,
      paddingTop: 20,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    featureIconContainer: {
      width: 24,
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginTop: 2,
    },
    featureTextContainer: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 2,
    },
    featureSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    ctaButton: {
      height: 56,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
      marginBottom: 16,
    },
    cancelAnytimeLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      textAlign: 'center',
      letterSpacing: 1.0,
    },
    gridContainer: {
      flexDirection: 'row',
      marginHorizontal: 24,
      gap: 16,
    },
    gridCard: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.grayBorder,
      padding: 16,
      alignItems: 'flex-start',
    },
    gridIcon: {
      marginBottom: 12,
    },
    gridTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    gridSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      lineHeight: 14,
    },
  });
