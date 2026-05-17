import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { AnimatedSplashOverlay } from "@/components/animated-icon";


export default function Layout() {
  return (
    <Provider store={store}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/otp-verify" />
        <Stack.Screen name="(tab)" />
      </Stack>
    </Provider>
  );
}
