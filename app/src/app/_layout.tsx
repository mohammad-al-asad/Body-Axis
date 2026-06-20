import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, RootState } from "@/redux/store";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { RevenueCatBootstrap } from "@/components/RevenueCatBootstrap";
import { useGetSubscriptionStatusQuery } from "@/redux/api/subscriptionApi";


function RootStack() {
  const firstTime = useSelector((state: RootState) => state.settings.firstTime);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const isEmailVerified = isAuthenticated && !!user?.email_verified;

  const { data: subscription, isLoading } = useGetSubscriptionStatusQuery(undefined, {
    skip: !isEmailVerified,
  });

  // Show loading while subscription status is being fetched for verified authenticated users
  if (isEmailVerified && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const hasActiveSubscription = isEmailVerified && !!subscription?.active;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Onboarding — only accessible on first launch before auth */}
      <Stack.Protected guard={firstTime && !isAuthenticated}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      {/* Auth route — accessible when not authenticated, or authenticated but not fully subscribed */}
      <Stack.Protected guard={(!isAuthenticated && !firstTime) || (isAuthenticated && !hasActiveSubscription)}>
        <Stack.Screen name="auth" />
      </Stack.Protected>

      {/* Main app — authenticated with verified email and active subscription */}
      <Stack.Protected guard={hasActiveSubscription}>
        <Stack.Screen name="(tab)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RevenueCatBootstrap />
        <AnimatedSplashOverlay />
        <RootStack />
      </PersistGate>
    </Provider>
  );
}
