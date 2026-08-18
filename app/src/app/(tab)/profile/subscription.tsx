import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useSelector } from 'react-redux';
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import type { RootState } from '@/redux/store';
import {
  useGetSubscriptionStatusQuery,
  useSyncSubscriptionStatusMutation,
} from '@/redux/api/subscriptionApi';
import {
  getRevenueCatErrorMessage,
  getCurrentOffering,
  getPackageForBillingPeriod,
  hasRealRevenueCatKey,
  isPremiumCustomerInfo,
  isRevenueCatSupported,
  configureRevenueCat,
  REVENUECAT_ENTITLEMENT_ID,
  restoreRevenueCatPurchases,
} from '@/services/revenueCat';

type CurrentPlanType = 'monthly' | 'yearly' | 'unknown' | 'none';

const normalizeIdentifier = (value?: string | null) => value?.trim().toLowerCase() ?? '';

const formatLabel = (value?: string | null, fallback = 'Not available') => {
  if (!value) {
    return fallback;
  }

  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const planTypeFromIdentifier = (value?: string | null): Exclude<CurrentPlanType, 'none'> | null => {
  const normalized = normalizeIdentifier(value);

  if (!normalized) {
    return null;
  }

  if (
    normalized.includes('monthly') ||
    normalized.includes('month') ||
    normalized.includes('p1m') ||
    normalized.endsWith('_1m') ||
    normalized.endsWith('-1m')
  ) {
    return 'monthly';
  }

  if (
    normalized.includes('yearly') ||
    normalized.includes('annual') ||
    normalized.includes('year') ||
    normalized.includes('p1y') ||
    normalized.endsWith('_1y') ||
    normalized.endsWith('-1y')
  ) {
    return 'yearly';
  }

  return null;
};

const getPackageIdentifiers = (pkg: PurchasesPackage | null) => {
  if (!pkg) {
    return [];
  }

  return [
    pkg.identifier,
    pkg.product.identifier,
    pkg.product.subscriptionPeriod,
    pkg.product.defaultOption?.id,
    pkg.product.defaultOption?.storeProductId,
    pkg.product.defaultOption?.productId,
  ]
    .map(normalizeIdentifier)
    .filter(Boolean);
};

export default function SubscriptionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);
  const user = useSelector((state: RootState) => state.auth.user);

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const { data: subscription } = useGetSubscriptionStatusQuery(undefined, {
    skip: !user,
  });
  const [syncSubscriptionStatus] = useSyncSubscriptionStatusMutation();

  const monthlyPackage = useMemo(
    () => getPackageForBillingPeriod(offering, 'monthly'),
    [offering]
  );
  const yearlyPackage = useMemo(
    () => getPackageForBillingPeriod(offering, 'yearly'),
    [offering]
  );

  const activeEntitlement = customerInfo?.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
  const activeProductId =
    activeEntitlement?.productIdentifier ??
    customerInfo?.activeSubscriptions[0] ??
    subscription?.product_id ??
    null;
  const activeProductPlanId = activeEntitlement?.productPlanIdentifier ?? null;

  const currentPlanType = useMemo<CurrentPlanType>(() => {
    if (!subscription?.active) {
      return 'none';
    }

    const activeSignals = [
      activeProductPlanId,
      activeProductId,
      subscription.product_id,
      ...(customerInfo?.activeSubscriptions ?? []),
    ].filter(Boolean) as string[];

    for (const signal of activeSignals) {
      const detectedPlanType = planTypeFromIdentifier(signal);
      if (detectedPlanType) {
        return detectedPlanType;
      }
    }

    const monthlyIdentifiers = getPackageIdentifiers(monthlyPackage);
    const yearlyIdentifiers = getPackageIdentifiers(yearlyPackage);
    const normalizedSignals = activeSignals.map(normalizeIdentifier);

    const monthlyMatches = normalizedSignals.some((signal) => monthlyIdentifiers.includes(signal));
    const yearlyMatches = normalizedSignals.some((signal) => yearlyIdentifiers.includes(signal));

    if (monthlyMatches && !yearlyMatches) {
      return 'monthly';
    }
    if (yearlyMatches && !monthlyMatches) {
      return 'yearly';
    }

    return 'unknown';
  }, [
    activeProductId,
    activeProductPlanId,
    customerInfo?.activeSubscriptions,
    monthlyPackage,
    subscription,
    yearlyPackage,
  ]);
  
  const activePlanTitle = useMemo(() => {
    if (!subscription?.active) {
      return 'No Active Plan';
    }

    if (currentPlanType === 'yearly') {
      return 'Premium Yearly Plan';
    }
    if (currentPlanType === 'monthly') {
      return 'Premium Monthly Plan';
    }

    return 'Premium Active Plan';
  }, [currentPlanType, subscription?.active]);

  const nextBilling = useMemo(() => {
    if (!subscription?.expires_at) {
      return 'Not available';
    }

    return new Date(subscription.expires_at).toLocaleDateString();
  }, [subscription]);

  const activePackage =
    currentPlanType === 'monthly'
      ? monthlyPackage
      : currentPlanType === 'yearly'
        ? yearlyPackage
        : null;
  const activePlanPrice = isLoadingPlans
    ? 'Loading'
    : activePackage?.product.priceString ?? 'Price unavailable';
  const activePlanPeriod =
    currentPlanType === 'monthly'
      ? '/mo'
      : currentPlanType === 'yearly'
        ? '/yr'
        : '';
  const activePlanCadence =
    currentPlanType === 'monthly'
      ? 'Monthly billing'
      : currentPlanType === 'yearly'
        ? 'Yearly billing'
        : 'Store managed';
  const renewalStatus = subscription?.will_renew
    ? 'Renews automatically'
    : subscription?.active
      ? 'Will not renew'
      : 'Inactive';
  const storeLabel = formatLabel(subscription?.store ?? activeEntitlement?.store, 'Store unavailable');
  const environmentLabel = formatLabel(subscription?.environment, 'Live store');

  useEffect(() => {
    let isMounted = true;

    async function loadPlans() {
      if (!user || !isRevenueCatSupported() || !hasRealRevenueCatKey(user)) {
        return;
      }

      setIsLoadingPlans(true);
      try {
        await configureRevenueCat(user);
        const [currentOffering, latestCustomerInfo] = await Promise.all([
          getCurrentOffering(user),
          Purchases.getCustomerInfo(),
        ]);
        if (isMounted) {
          setOffering(currentOffering);
          setCustomerInfo(latestCustomerInfo);
        }
      } catch (error) {
        console.warn('Failed to load RevenueCat subscription plans', error);
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

  const handleUpgradeToYearly = async () => {
    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    if (!isRevenueCatSupported()) {
      Alert.alert('Upgrade unavailable', 'Subscriptions can be changed from the mobile app.');
      return;
    }

    if (!hasRealRevenueCatKey(user)) {
      Alert.alert(
        'Upgrade unavailable',
        'RevenueCat is using a placeholder key for this platform. Add the real public SDK key before testing subscription changes.'
      );
      return;
    }

    if (!yearlyPackage) {
      Alert.alert('Yearly plan unavailable', 'RevenueCat did not return the yearly plan yet. Check the offering and product setup.');
      return;
    }

    setIsUpgrading(true);

    try {
      await configureRevenueCat(user);
      const productChangeInfo =
        Platform.OS === 'android' && activeProductId
          ? {
              oldProductIdentifier: activeProductId,
              replacementMode: Purchases.STORE_REPLACEMENT_MODE.WITHOUT_PRORATION,
            }
          : null;

      const { customerInfo } = await Purchases.purchasePackage(
        yearlyPackage,
        null,
        productChangeInfo
      );

      if (!isPremiumCustomerInfo(customerInfo)) {
        Alert.alert(
          'Subscription pending',
          'The purchase completed, but premium access was not active yet. Please try restore purchase.'
        );
        return;
      }

      await syncSubscriptionStatus().unwrap();
      setCustomerInfo(customerInfo);
      Alert.alert('Subscription Updated', 'Your yearly plan is now active.');
    } catch (error) {
      console.warn('Failed to upgrade subscription', error);
      const message = getRevenueCatErrorMessage(error);
      if (message) {
        Alert.alert('Upgrade failed', message);
      }
    } finally {
      setIsUpgrading(false);
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

      await syncSubscriptionStatus().unwrap();
      setCustomerInfo(customerInfo);
      Alert.alert('Restore Success', 'Your active membership has been successfully restored.');
    } catch (error) {
      console.warn('Failed to restore RevenueCat purchases', error);
      const message = getRevenueCatErrorMessage(error);
      if (message) {
        Alert.alert('Restore failed', message);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManageSubscription = () => {
    const url = subscription?.management_url ?? (Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions');
    
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open store subscription URL:", err);
      Alert.alert('Store Unavailable', 'Could not open store settings automatically. Please manage your subscription within your device system settings.');
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Header onBackPress={() => router.back()} showNotification={true} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Active Plan Gradient Card */}
          <View
            style={styles.activeCard}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setCardWidth(width);
              setCardHeight(height);
            }}
          >
            {cardWidth > 0 && cardHeight > 0 && (
              <Svg height={cardHeight} width={cardWidth} style={StyleSheet.absoluteFillObject}>
                <Defs>
                  <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#62FAE3" stopOpacity="1" />
                  </SvgLinearGradient>
                </Defs>
                <Rect width={cardWidth} height={cardHeight} rx={20} fill="url(#grad)" />
              </Svg>
            )}

            <View style={styles.activeCardContent}>
              <View style={styles.activeCardHeaderRow}>
                <View style={styles.activePlanBadge}>
                  <Text style={styles.activePlanBadgeText}>ACTIVE PLAN</Text>
                </View>
                <View style={styles.starCircle}>
                  <Feather name="award" size={18} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.activePlanTitle}>{activePlanTitle}</Text>
              <Text style={styles.activePlanCadence}>{activePlanCadence}</Text>

              <View style={styles.activePriceBlock}>
                <Text style={styles.activePriceLabel}>CURRENT PRICE</Text>
                <View style={styles.activePriceRow}>
                  <Text style={styles.activePriceText}>{activePlanPrice}</Text>
                  {!!activePlanPeriod && (
                    <Text style={styles.activePricePeriod}>{activePlanPeriod}</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.activeDetailsGrid}>
                <View style={styles.activeDetailItem}>
                  <Text style={styles.activeDetailLabel}>NEXT BILLING</Text>
                  <Text style={styles.activeDetailValue}>{nextBilling}</Text>
                </View>

                <View style={styles.activeDetailItem}>
                  <Text style={styles.activeDetailLabel}>RENEWAL</Text>
                  <Text style={styles.activeDetailValue}>{renewalStatus}</Text>
                </View>
              </View>

            </View>
          </View>

          {/* Plan Options Section */}
          {currentPlanType === 'monthly' && (
            <>
              <Text style={styles.sectionHeader}>Upgrade Available</Text>

              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.85}
                onPress={handleUpgradeToYearly}
                disabled={isLoadingPlans || isUpgrading || !yearlyPackage}
              >
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>BEST VALUE</Text>
                </View>

                <View style={styles.optionTopSection}>
                  <Text style={styles.optionPlanName}>Premium Yearly</Text>
                  <Text style={styles.optionPlanDuration}>Length: 1 Year (Annual Auto-Renewable)</Text>
                </View>

                <View style={styles.optionPriceBlock}>
                  <View style={styles.optionPriceRow}>
                    <Text
                      style={styles.optionPlanPrice}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {isLoadingPlans
                        ? 'Loading'
                        : yearlyPackage?.product.priceString ?? 'Unavailable'}
                    </Text>
                    <Text style={styles.pricePeriod}>/yr</Text>
                  </View>
                  {yearlyPackage?.product.pricePerMonthString && (
                    <Text style={styles.optionPricePerMonth}>
                      {yearlyPackage.product.pricePerMonthString}/month billed annually
                    </Text>
                  )}
                </View>

                <Text style={styles.optionPlanDescription}>
                  Switch from monthly to yearly billing with Premium Yearly. Auto-renews annually for {yearlyPackage?.product.priceString ?? 'the yearly price'} until cancelled. RevenueCat and your app store will handle the subscription change.
                </Text>

                <View style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>
                    {isUpgrading
                      ? 'Upgrading...'
                      : isLoadingPlans
                        ? 'Loading plan...'
                        : yearlyPackage
                          ? 'Upgrade to Premium Yearly'
                          : 'Yearly Plan Unavailable'}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {currentPlanType === 'yearly' && (
            <>
              <Text style={styles.sectionHeader}>Plan Options</Text>
              <View style={styles.infoCard}>
                <Feather name="check-circle" size={18} color={theme.quaternary} />
                <Text style={styles.infoCardText}>
                  You are already on the Premium Yearly plan with the best value.
                </Text>
              </View>
            </>
          )}

          {currentPlanType === 'unknown' && (
            <>
              <Text style={styles.sectionHeader}>Plan Options</Text>
              <View style={styles.infoCard}>
                <Feather name="info" size={18} color={theme.quaternary} />
                <Text style={styles.infoCardText}>
                  Your active plan is managed by the app store. Use Manage Subscription to make changes.
                </Text>
              </View>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.restoreBtn}
              activeOpacity={0.8}
              onPress={handleRestore}
              disabled={isRestoring}
            >
              <Text style={styles.restoreBtnText}>
                {isRestoring ? 'Restoring...' : 'Restore Purchase'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manageBtn}
              activeOpacity={0.8}
              onPress={handleManageSubscription}
            >
              <Text style={styles.manageBtnText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Info and Links */}
          <Text style={styles.legalText}>
            Payments will be charged to your store account at confirmation of purchase. Subscriptions (Premium Monthly for 1 month, Premium Yearly for 1 year) automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage or cancel your subscription anytime in your store account settings.
          </Text>

          <View style={styles.footerLinksRow}>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.push('/terms')}>
              <Text style={styles.footerLinkText}>Terms of Use (EULA)</Text>
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 18,
    },
    activeCard: {
      borderRadius: 20,
      marginBottom: 24,
      minHeight: 320,
      overflow: 'hidden',
      position: 'relative',
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    activeCardContent: {
      flex: 1,
      padding: 24,
    },
    activeCardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    activePlanBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    activePlanBadgeText: {
      color: theme.background,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    starCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    activePlanTitle: {
      fontSize: 25,
      fontWeight: '800',
      color: '#FFFFFF',
      marginTop: 5,
      marginBottom: 4,
    },
    activePlanCadence: {
      color: 'rgba(255, 255, 255, 0.72)',
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 18,
    },
    activePriceBlock: {
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    activePriceLabel: {
      color: 'rgba(255, 255, 255, 0.65)',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    activePriceRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    activePriceText: {
      color: '#FFFFFF',
      fontSize: 36,
      fontWeight: '900',
      letterSpacing: -1,
      flexShrink: 1,
    },
    activePricePeriod: {
      color: 'rgba(255, 255, 255, 0.76)',
      fontSize: 16,
      fontWeight: '800',
      marginLeft: 4,
      marginBottom: 5,
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      marginVertical: 12,
    },
    activeDetailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 12,
    },
    activeBottomGrid: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    activeDetailItem: {
      width: '48%',
      backgroundColor: 'rgba(5, 11, 20, 0.16)',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    activeDetailLabel: {
      color: 'rgba(255, 255, 255, 0.58)',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    activeDetailValue: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    activeCardFooterRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    nextBillingLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    nextBillingVal: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    validStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    validDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#10B981',
      marginRight: 6,
    },
    inactiveDot: {
      backgroundColor: '#F97316',
    },
    validStatusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginTop: 14,
      marginBottom: 12,
    },
    optionCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1.5,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 24,
      minHeight: 100,
      justifyContent: 'center',
      marginBottom: 14,
      position: 'relative',
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    currentBadge: {
      position: 'absolute',
      top: -10,
      right: 15,
      backgroundColor: theme.quaternary,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    currentBadgeText: {
      color: '#050B14',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    optionTopSection: {
      marginBottom: 12,
      paddingRight: 88,
    },
    optionPlanName: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 3,
    },
    optionPlanDuration: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.quaternary,
    },
    optionPriceBlock: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
    },
    optionPriceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'nowrap',
    },
    optionPlanPrice: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.quaternary,
      letterSpacing: -0.5,
      flexShrink: 1,
    },
    pricePeriod: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.textSecondary,
      marginLeft: 4,
    },
    optionPricePerMonth: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      marginTop: 3,
    },
    optionPlanDescription: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 19,
    },
    upgradeButton: {
      height: 46,
      borderRadius: 14,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 18,
    },
    upgradeButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: 14,
    },
    infoCardText: {
      flex: 1,
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    actionContainer: {
      marginTop: 'auto',
      marginBottom: 24,
      gap: 12,
    },
    restoreBtn: {
      height: 48,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.cardBorder,
      backgroundColor: theme.cardBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    restoreBtnText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '800',
    },
    manageBtn: {
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    manageBtnText: {
      color: theme.quaternary,
      fontSize: 14,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    legalText: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
      textAlign: 'center',
      marginBottom: 20,
    },
    footerLinksRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    footerLinkText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.quaternary,
    },
    footerDot: {
      fontSize: 12,
      color: theme.textSecondary,
    },
  });
