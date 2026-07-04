import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="intake" />
      <Stack.Screen name="downloads" />
      <Stack.Screen name="sessions" />
    </Stack>
  );
}
