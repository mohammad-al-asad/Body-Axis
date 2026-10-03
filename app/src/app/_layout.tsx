import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { store, persistor, RootState } from "@/redux/store";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { RevenueCatBootstrap } from "@/components/RevenueCatBootstrap";
import { AppUpdateChecker } from "@/components/AppUpdateChecker";
import { useGetSubscriptionStatusQuery } from "@/redux/api/subscriptionApi";


function RootStack() {
  const router = useRouter();
  const segments = useSegments();

  const firstTime = useSelector((state: RootState) => state.settings.firstTime);
  const hasSeenIntroduction = useSelector((state: RootState) => state.settings.hasSeenIntroduction);
  const localIsPremium = useSelector((state: RootState) => state.settings.localIsPremium);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const isEmailVerified = isAuthenticated && !!user?.email_verified;

  const { data: subscription, isLoading } = useGetSubscriptionStatusQuery(undefined, {
    skip: !isEmailVerified,
  });

  const hasActiveSubscription = isEmailVerified && (!!subscription?.active || localIsPremium);
  const isFullyReady = hasActiveSubscription && hasSeenIntroduction;

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";
    const isPublicRoute =
      segments[0] === "privacy" ||
      segments[0] === "terms" ||
      segments[0] === "support";

    if (isPublicRoute) return;

    if (!isAuthenticated) {
      if (firstTime && !inOnboarding) {
        router.replace("/onboarding");
      } else if (!firstTime && !inAuthGroup) {
        router.replace("/auth/sign-in");
      }
    } else if (isFullyReady && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, firstTime, isFullyReady, segments]);

  // Show loading while subscription status is being fetched for verified authenticated users
  if (isEmailVerified && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Onboarding — only accessible on first launch before auth */}
      <Stack.Protected guard={firstTime && !isAuthenticated}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      {/* Auth route — accessible when not authenticated, or authenticated but not fully ready for main app */}
      <Stack.Protected guard={(!isAuthenticated && !firstTime) || (isAuthenticated && !isFullyReady)}>
        <Stack.Screen name="auth" />
      </Stack.Protected>

      {/* Main app — authenticated with verified email, active subscription, and has seen introduction */}
      <Stack.Protected guard={isFullyReady}>
        <Stack.Screen name="(tab)" />
      </Stack.Protected>

      {/* Public routes — accessible to anyone at any stage */}
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="support" />
    </Stack>
  );
}

export default function Layout() {
  return (
    <KeyboardProvider preload={false}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RevenueCatBootstrap />
          <AnimatedSplashOverlay />
          <RootStack />
          <AppUpdateChecker />
        </PersistGate>
      </Provider>
    </KeyboardProvider>
  );
}
