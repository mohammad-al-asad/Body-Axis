import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { logout } from '@/redux/slice/auth';
import { setLocalIsPremium } from '@/redux/slice/settings';

import { useTheme } from '@/hooks/use-theme';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomTab } from '@/components/ui/CustomTab';
import { AuthHeader } from '@/components/ui/AuthHeader';
import type { RootState } from '@/redux/store';
import { useSyncSubscriptionStatusMutation } from '@/redux/api/subscriptionApi';
import {
  BillingPeriod,
  configureRevenueCat,
  getCurrentOffering,
  getPackageForBillingPeriod,
  getRevenueCatErrorMessage,
  hasRealRevenueCatKey,
  isPremiumCustomerInfo,
  isRevenueCatSupported,
  restoreRevenueCatPurchases,
} from '@/services/revenueCat';

export default function PremiumScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [syncSubscriptionStatus] = useSyncSubscriptionStatusMutation();

  const monthlyPackage = useMemo(
    () => getPackageForBillingPeriod(offering, 'monthly'),
    [offering]
  );
  const yearlyPackage = useMemo(
    () => getPackageForBillingPeriod(offering, 'yearly'),
    [offering]
  );
  const selectedPackage = billingPeriod === 'monthly' ? monthlyPackage : yearlyPackage;

  useEffect(() => {
    let isMounted = true;

    async function loadPlans() {
      if (!user || !isRevenueCatSupported() || !hasRealRevenueCatKey()) {
        return;
      }

      setIsLoadingPlans(true);

      try {
        await configureRevenueCat(user);
        const currentOffering = await getCurrentOffering(user);
        const customerInfo = await Purchases.getCustomerInfo();

        if (!isMounted) {
          return;
        }

        setOffering(currentOffering);
        setHasPremium(isPremiumCustomerInfo(customerInfo));
      } catch (error) {
        console.warn('Failed to load RevenueCat plans', error);
      } finally {
        if (isMounted) {
          setIsLoadingPlans(false);
        }
      }
    }

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleStartJourney = async () => {
    if (hasPremium) {
      dispatch(setLocalIsPremium(true));
      syncSubscriptionStatus().unwrap().catch((error) => {
        console.warn('Backend subscription sync failed', error);
      });
      router.replace('/auth/introduction');
      return;
    }

    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    if (!isRevenueCatSupported()) {
      Alert.alert('Subscriptions unavailable', 'Subscriptions can be purchased from the mobile app.');
      return;
    }

    if (!hasRealRevenueCatKey()) {
      Alert.alert(
        'Subscriptions not configured',
        'RevenueCat is using a placeholder key for this platform. Add the real public SDK key before testing purchases.'
      );
      return;
    }

    if (!selectedPackage) {
      Alert.alert('Plan unavailable', 'RevenueCat did not return this plan yet. Check the offering and product setup.');
      return;
    }

    setIsPurchasing(true);

    try {
      await configureRevenueCat(user);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      if (!isPremiumCustomerInfo(customerInfo)) {
        Alert.alert('Subscription pending', 'The purchase completed, but premium access was not active yet. Please try restore purchase.');
        return;
      }

      setHasPremium(true);
      dispatch(setLocalIsPremium(true));
      syncSubscriptionStatus().unwrap().catch((error) => {
        console.warn('Backend subscription sync failed', error);
      });

      router.replace('/auth/introduction');
    } catch (error) {
      const message = getRevenueCatErrorMessage(error);
      if (message) {
        Alert.alert('Purchase failed', message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    if (!isRevenueCatSupported()) {
      Alert.alert('Restore unavailable', 'Purchases can be restored from the mobile app.');
      return;
    }

    if (!hasRealRevenueCatKey()) {
      Alert.alert(
        'Restore unavailable',
        'RevenueCat is using a placeholder key for this platform. Add the real public SDK key before testing restore.'
      );
      return;
    }

    setIsRestoring(true);

    try {
      const customerInfo = await restoreRevenueCatPurchases(user);

      if (!isPremiumCustomerInfo(customerInfo)) {
        Alert.alert('No active subscription', 'No active premium subscription was found for this store account.');
        return;
      }

      setHasPremium(true);
      dispatch(setLocalIsPremium(true));
      syncSubscriptionStatus().unwrap().catch((error) => {
        console.warn('Backend subscription sync failed', error);
      });

      router.replace('/auth/introduction');
    } catch (error) {
      const message = getRevenueCatErrorMessage(error);
      if (message) {
        Alert.alert('Restore failed', message);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleHelp = () => {
    Alert.alert('Subscription Info', 'Body Axis Premium gives you access to personalized movement sessions, exercise guidance, progress tracking, and offline plan downloads.');
  };

  const handleBack = () => {
    dispatch(logout());
    router.replace('/auth/sign-in');
  };

  const priceText = selectedPackage?.product.priceString;
  const periodText = billingPeriod === 'monthly' ? '/month' : '/year';
  const ctaTitle = hasPremium
    ? 'Continue'
    : billingPeriod === 'monthly'
      ? 'Start Premium Monthly Plan'
      : 'Start Premium Yearly Plan';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AuthHeader onHelpPress={handleHelp} showShadow onBackPress={handleBack} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Titles */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              Body Axis Premium
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
            {!isLoadingPlans && !selectedPackage ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={20} color={theme.error} style={{ marginBottom: 8 }} />
                <Text style={styles.errorText}>
                  Subscription plan is currently unavailable. Please check your connection or try again later.
                </Text>
              </View>
            ) : (
              <View style={styles.priceContainer}>
                <Text style={styles.accessLabel}>
                  {billingPeriod === 'monthly' ? 'PREMIUM MONTHLY • 1 MONTH' : 'PREMIUM YEARLY • 1 YEAR'}
                </Text>
                <View style={styles.priceRow}>
                  <Text
                    style={styles.priceAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {isLoadingPlans ? '...' : priceText}
                  </Text>
                  <Text style={styles.pricePeriod} numberOfLines={1}>{periodText}</Text>
                </View>
                {billingPeriod === 'yearly' && yearlyPackage?.product.pricePerMonthString && (
                  <Text style={styles.billingAnnuallyLabel}>
                    {yearlyPackage.product.pricePerMonthString}/month billed annually
                  </Text>
                )}
                <Text style={styles.renewalNotice}>
                  {billingPeriod === 'monthly'
                    ? '1 Month auto-renewing subscription. Renews monthly.'
                    : '1 Year auto-renewing subscription. Renews annually.'}
                </Text>
              </View>
            )}

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
              title={ctaTitle}
              isLoading={isPurchasing || isLoadingPlans}
              disabled={!hasPremium && !selectedPackage && hasRealRevenueCatKey()}
              onPress={handleStartJourney}
              style={styles.ctaButton}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isRestoring}
              onPress={handleRestore}
              style={styles.restoreButton}
            >
              <Text style={styles.restoreButtonText}>
                {isRestoring ? 'Restoring...' : 'Restore purchase'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.cancelAnytimeLabel}>CANCEL ANYTIME</Text>
            <Text style={styles.legalNoticeText}>
              Payment will be charged to your store account at confirmation of purchase. Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current billing period. Manage or cancel anytime in account settings.
            </Text>
          </View>

          {/* Bottom Dual Grid */}
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() => router.push('/terms')}
            >
              <Feather name="file-text" size={18} color={theme.secondary} style={styles.gridIcon} />
              <Text style={styles.gridTitle}>Terms of Use (EULA)</Text>
              <Text style={styles.gridSubtitle}>Read our terms & EULA.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() => router.push('/privacy')}
            >
              <Feather name="shield" size={18} color={theme.secondary} style={styles.gridIcon} />
              <Text style={styles.gridTitle}>Privacy Policy</Text>
              <Text style={styles.gridSubtitle}>Read our data & privacy policy.</Text>
            </TouchableOpacity>
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
      paddingBottom: 32,
      marginTop:24
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
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
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
      justifyContent: 'center',
      maxWidth: '100%',
      paddingHorizontal: 8,
    },
    priceAmount: {
      fontSize: 48,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: -1,
      flexShrink: 1,
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
    renewalNotice: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '500',
      marginTop: 6,
      textAlign: 'center',
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
    restoreButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 32,
      marginBottom: 12,
    },
    restoreButtonText: {
      color: theme.secondary,
      fontSize: 14,
      fontWeight: '700',
    },
    cancelAnytimeLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      textAlign: 'center',
      letterSpacing: 1.0,
    },
    legalNoticeText: {
      fontSize: 10,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 14,
      marginTop: 10,
    },
    gridContainer: {
      flexDirection: 'row',
      marginHorizontal: 24,
      gap: 16,
      marginBottom:24
    },
    gridCard: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.grayBorder,
      padding: 16,
      alignItems: 'flex-start',
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
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
    errorContainer: {
      backgroundColor: theme.error + '1A',
      borderWidth: 1,
      borderColor: theme.error,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    errorText: {
      color: theme.error,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 18,
    },
  });
