import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

import type { AuthUser } from '@/redux/api/authApi';

export type BillingPeriod = 'monthly' | 'yearly';

export const REVENUECAT_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? 'premium';

const PLACEHOLDER_API_KEY_PARTS = [
  'dummy',
  'replace',
  'your_public',
  'your_revenuecat',
  'your-sdk-key',
];

const TEST_STORE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '';
const TEST_EMAILS = [
  'blackboys11914@gmail.com',
  'maasad11914@gmail.com',
];

let configuredAppUserId: string | null = null;
let configuredApiKey: string | null = null;
let configurePromise: Promise<boolean> | null = null;

function isTestUser(user: AuthUser | null): boolean {
  if (!user?.email) return false;
  return TEST_EMAILS.includes(user.email.toLowerCase());
}

function getRevenueCatApiKey(user: AuthUser | null = null) {
  if (isTestUser(user)) {
    return TEST_STORE_API_KEY;
  }

  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? null;
  }

  if (Platform.OS === 'android') {
    return (
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
    );
  }

  return null;
}

export function isRevenueCatSupported() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function hasRealRevenueCatKey(user: AuthUser | null = null) {
  const apiKey = getRevenueCatApiKey(user);

  if (!apiKey) {
    return false;
  }

  const normalizedKey = apiKey.trim().toLowerCase();
  return !PLACEHOLDER_API_KEY_PARTS.some((part) => normalizedKey.includes(part));
}

export async function configureRevenueCat(user: AuthUser | null) {
  if (!isRevenueCatSupported()) {
    return false;
  }

  const apiKey = getRevenueCatApiKey(user);
  if (!apiKey || !hasRealRevenueCatKey(user) || !user?.id) {
    return false;
  }

  // If the API key changed (switching between test/production user),
  // force reconfiguration
  if (configuredApiKey && configuredApiKey !== apiKey) {
    configurePromise = null;
    configuredAppUserId = null;
    configuredApiKey = null;
  }

  if (configurePromise && configuredAppUserId === user.id) {
    return configurePromise;
  }

  const nextConfigurePromise = (async () => {
    await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.INFO);

    const isConfigured = await Purchases.isConfigured();
    if (!isConfigured || configuredApiKey !== apiKey) {
      Purchases.configure({
        apiKey,
        appUserID: user.id,
      });
    } else if (configuredAppUserId !== user.id) {
      await Purchases.logIn(user.id);
    }

    configuredAppUserId = user.id;
    configuredApiKey = apiKey;
    await Purchases.setAttributes({
      backend_user_id: user.id,
    });
    await Purchases.setEmail(user.email);
    await Purchases.setDisplayName(user.full_name);

    return true;
  })();

  configurePromise = nextConfigurePromise.catch((error) => {
    if (configuredAppUserId === user.id || !configuredAppUserId) {
      configurePromise = null;
      configuredAppUserId = null;
    }
    throw error;
  });

  return configurePromise;
}

export async function resetRevenueCatUser() {
  configurePromise = null;

  if (!isRevenueCatSupported() || !configuredAppUserId) {
    configuredAppUserId = null;
    configuredApiKey = null;
    return;
  }

  const isConfigured = await Purchases.isConfigured();
  if (isConfigured) {
    await Purchases.logOut();
  }

  configuredAppUserId = null;
  configuredApiKey = null;
}

export function isPremiumCustomerInfo(customerInfo: CustomerInfo) {
  return Boolean(customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID]);
}

export async function getCurrentOffering(user: AuthUser | null) {
  const configured = await configureRevenueCat(user);
  if (!configured) {
    return null;
  }

  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export function getPackageForBillingPeriod(
  offering: PurchasesOffering | null,
  billingPeriod: BillingPeriod
): PurchasesPackage | null {
  if (!offering) {
    return null;
  }

  if (billingPeriod === 'monthly') {
    return (
      offering.monthly ??
      offering.availablePackages.find((pkg) => pkg.identifier === '$rc_monthly') ??
      null
    );
  }

  return (
    offering.annual ??
    offering.availablePackages.find((pkg) => pkg.identifier === '$rc_annual') ??
    null
  );
}

export async function restoreRevenueCatPurchases(user: AuthUser | null) {
  const configured = await configureRevenueCat(user);
  if (!configured) {
    throw new Error('RevenueCat is not configured for this platform.');
  }

  return Purchases.restorePurchases();
}

export function getRevenueCatErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const maybeError = error as {
      userCancelled?: boolean;
      message?: string;
      readableErrorCode?: string;
    };

    if (maybeError.userCancelled) {
      return null;
    }

    if (typeof maybeError.message === 'string') {
      return maybeError.message;
    }

    if (typeof maybeError.readableErrorCode === 'string') {
      return maybeError.readableErrorCode;
    }
  }

  return 'Subscription is unavailable right now. Please try again.';
}
