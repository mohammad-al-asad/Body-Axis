import { Stack } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetSubscriptionStatusQuery } from "@/redux/api/subscriptionApi";

export default function AuthLayout() {
  const firstTime = useSelector((state: RootState) => state.settings.firstTime);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { data: subscription } = useGetSubscriptionStatusQuery(undefined, {
    skip: !isAuthenticated,
  });

  const hasActiveSubscription = isAuthenticated && !!subscription?.active;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth screens for unauthenticated users */}
      <Stack.Protected guard={!isAuthenticated && !firstTime}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="otp-verify" />
        <Stack.Screen name="set-password" />
      </Stack.Protected>

      {/* Premium screen for authenticated users without active subscription */}
      <Stack.Protected guard={isAuthenticated && !hasActiveSubscription}>
        <Stack.Screen name="premium" />
      </Stack.Protected>
    </Stack>
  );
}
