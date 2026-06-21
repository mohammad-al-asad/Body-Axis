import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Purchases from 'react-native-purchases';

import { configureRevenueCat, resetRevenueCatUser, isPremiumCustomerInfo } from '@/services/revenueCat';
import type { RootState } from '@/redux/store';
import { setLocalIsPremium } from '@/redux/slice/settings';
import { useSyncSubscriptionStatusMutation } from '@/redux/api/subscriptionApi';

export function RevenueCatBootstrap() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [syncSubscriptionStatus] = useSyncSubscriptionStatusMutation();

  useEffect(() => {
    if (!user) {
      resetRevenueCatUser().catch((error) => {
        console.warn('RevenueCat logout failed', error);
      });
      dispatch(setLocalIsPremium(false));
      return;
    }

    async function initAndSync() {
      try {
        const configured = await configureRevenueCat(user);
        if (configured) {
          const customerInfo = await Purchases.getCustomerInfo();
          const isPremium = isPremiumCustomerInfo(customerInfo);
          dispatch(setLocalIsPremium(isPremium));

          if (isPremium) {
            // Trigger backend sync to ensure the backend DB is updated
            await syncSubscriptionStatus().unwrap();
          }
        }
      } catch (error) {
        console.warn('RevenueCat init/sync failed', error);
      }
    }

    initAndSync();
  }, [user]);

  return null;
}
