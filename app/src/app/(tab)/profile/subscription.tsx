import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useSelector } from 'react-redux';

import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import type { RootState } from '@/redux/store';
import {
  useGetSubscriptionStatusQuery,
  useSyncSubscriptionStatusMutation,
} from '@/redux/api/subscriptionApi';
import {
  getRevenueCatErrorMessage,
  hasRealRevenueCatKey,
  isPremiumCustomerInfo,
  isRevenueCatSupported,
  restoreRevenueCatPurchases,
} from '@/services/revenueCat';

export default function SubscriptionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);
  const user = useSelector((state: RootState) => state.auth.user);

  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [isRestoring, setIsRestoring] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const { data: subscription } = useGetSubscriptionStatusQuery(undefined, {
    skip: !user,
  });
  const [syncSubscriptionStatus] = useSyncSubscriptionStatusMutation();

  const activePlanTitle = useMemo(() => {
    const productId = subscription?.product_id ?? '';
    if (!subscription?.active) {
      return 'No Active Plan';
    }

    return productId.toLowerCase().includes('year')
      ? 'Premium Annual Plan'
      : 'Premium Monthly Plan';
  }, [subscription]);

  const nextBilling = useMemo(() => {
    if (!subscription?.expires_at) {
      return 'Not available';
    }

    return new Date(subscription.expires_at).toLocaleDateString();
  }, [subscription]);

  useEffect(() => {
    const productId = subscription?.product_id?.toLowerCase() ?? '';
    if (productId.includes('month')) {
      setSelectedPlan('monthly');
    }
    if (productId.includes('year')) {
      setSelectedPlan('yearly');
    }
  }, [subscription?.product_id]);

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

  const benefits = [
    'Unlimited corrective programs',
    'Personalized mobility protocols',
    'Advanced movement assessments',
    'Full exercise video library',
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onBackPress={() => router.back()} showNotification={true} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle}>Manage your premium wellness membership</Text>

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

              <View style={styles.divider} />

              <View style={styles.activeCardFooterRow}>
                <View>
                  <Text style={styles.nextBillingLabel}>NEXT BILLING</Text>
                  <Text style={styles.nextBillingVal}>{nextBilling}</Text>
                </View>

                <View style={styles.validStatusBadge}>
                  <View style={[styles.validDot, !subscription?.active && styles.inactiveDot]} />
                  <Text style={styles.validStatusText}>
                    {subscription?.active ? 'Valid' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Membership Benefits Section */}
          <Text style={styles.sectionHeader}>Membership Benefits</Text>
          {benefits.map((benefit, idx) => (
            <View key={idx} style={styles.benefitCard}>
              <View style={styles.checkCircle}>
                <Feather name="check" size={12} color={theme.quaternary} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}

          {/* Plan Options Section */}
          <Text style={styles.sectionHeader}>Plan Options</Text>

          {/* Yearly Plan Card */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedPlan === 'yearly' && styles.optionCardSelected,
            ]}
            activeOpacity={0.85}
            onPress={() => setSelectedPlan('yearly')}
          >
            {selectedPlan === 'yearly' && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>CURRENT</Text>
              </View>
            )}
            <View style={styles.optionHeaderRow}>
              <Text style={[styles.optionPlanName, selectedPlan === 'yearly' && {color: "#fff"}]}>Yearly</Text>
              <Text style={styles.optionPlanPrice}>$199<Text style={styles.pricePeriod}>/yr</Text></Text>
            </View>
            <Text style={styles.optionPlanDescription}>
              Best value. Save $101 compared to monthly.
            </Text>
          </TouchableOpacity>

          {/* Monthly Plan Card */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedPlan === 'monthly' && styles.optionCardSelected,
            ]}
            activeOpacity={0.85}
            onPress={() => setSelectedPlan('monthly')}
          >
            {selectedPlan === 'monthly' && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>CURRENT</Text>
              </View>
            )}
            <View style={styles.optionHeaderRow}>
              <Text style={[styles.optionPlanName, selectedPlan === 'monthly' && {color: "#fff"}]}>Monthly</Text>
              <Text style={styles.optionPlanPrice}>$25<Text style={styles.pricePeriod}>/mo</Text></Text>
            </View>
            <Text style={styles.optionPlanDescription}>
              Flexible access. Cancel anytime.
            </Text>
          </TouchableOpacity>

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
            Payments will be charged to your store account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. You can manage or cancel your subscription at any time in your store account settings.
          </Text>

          <View style={styles.footerLinksRow}>
            <TouchableOpacity onPress={() => router.push('/profile/privacy')}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.push('/profile/terms')}>
              <Text style={styles.footerLinkText}>Terms of Use</Text>
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
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 4,
      marginBottom: 20,
    },
    activeCard: {
      borderRadius: 20,
      marginBottom: 24,
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
      padding: 20,
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
    divider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      marginVertical: 12,
    },
    activeCardFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
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
    benefitCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 10,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    checkCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(98, 250, 227, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(98, 250, 227, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    benefitText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textSecondary,
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
    optionCardSelected: {
      borderColor: theme.quaternary,
      backgroundColor: theme.backgroundSelected === "#E0E1E6" ? "#050B14" : theme.backgroundSelected,
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
    optionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    optionPlanName: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text,
    },
    optionPlanPrice: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.quaternary,
    },
    pricePeriod: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    optionPlanDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    actionContainer: {
      marginTop: 10,
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
