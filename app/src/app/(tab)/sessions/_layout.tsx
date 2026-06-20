import { Stack } from 'expo-router';

export default function SessionsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="plan-details" />
      <Stack.Screen name="exercise-tracker" />
    </Stack>
  );
}
