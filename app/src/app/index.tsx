import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

import { RootState } from '@/redux/store';
import { useGetSubscriptionStatusQuery } from '@/redux/api/subscriptionApi';

export default function IndexRedirect() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const firstTime = useSelector((state: RootState) => state.settings.firstTime);
  console.log("isAuthenticated", isAuthenticated);

  const { data: subscription, isLoading } = useGetSubscriptionStatusQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (isAuthenticated) {
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (subscription?.active) {
      return <Redirect href="/(tab)" />;
    }

    return <Redirect href="/(auth)/premium" />;
  }

  if (firstTime) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}

