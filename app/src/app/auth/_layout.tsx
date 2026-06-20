import { Stack } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetSubscriptionStatusQuery } from "@/redux/api/subscriptionApi";

export default function AuthLayout() {
  const firstTime = useSelector((state: RootState) => state.settings.firstTime);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: subscription } = useGetSubscriptionStatusQuery(undefined, {
    skip: !isAuthenticated,
  });

  const hasActiveSubscription = isAuthenticated && !!subscription?.active;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth screens for unauthenticated users or authenticated but unverified email */}
      <Stack.Protected
        guard={
          (!isAuthenticated && !firstTime) ||
          (isAuthenticated && !user?.email_verified)
        }
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="otp-verify" />
        <Stack.Screen name="set-password" />
      </Stack.Protected>

      {/* Premium screen for authenticated users with verified email but without active subscription */}
      <Stack.Protected
        guard={
          isAuthenticated && !!user?.email_verified && !hasActiveSubscription
        }
      >
        <Stack.Screen name="premium" />
      </Stack.Protected>
        <Stack.Screen name="introduction" />
    </Stack>
  );
}
