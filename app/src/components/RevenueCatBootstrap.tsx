import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { configureRevenueCat, resetRevenueCatUser } from '@/services/revenueCat';
import type { RootState } from '@/redux/store';

export function RevenueCatBootstrap() {
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user) {
      resetRevenueCatUser().catch((error) => {
        console.warn('RevenueCat logout failed', error);
      });
      return;
    }

    configureRevenueCat(user).catch((error) => {
      console.warn('RevenueCat configuration failed', error);
    });
  }, [user]);

  return null;
}
