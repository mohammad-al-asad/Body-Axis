import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { AnimatedSplashOverlay } from "@/components/animated-icon";


export default function Layout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(intake)" />
          <Stack.Screen name="(auth)/sign-in" />
          <Stack.Screen name="(auth)/sign-up" />
          <Stack.Screen name="(auth)/forgot-password" />
          <Stack.Screen name="(auth)/otp-verify" />
          <Stack.Screen name="(auth)/set-password" />
          <Stack.Screen name="(auth)/premium" />
          <Stack.Screen name="(tab)" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
