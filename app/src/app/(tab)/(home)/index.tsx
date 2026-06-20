import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { HomeOnboarding } from '@/components/home/HomeOnboarding';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { RootState } from '@/redux/store';

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const isIntakeCompleted = user?.is_intake_completed ?? false;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Section */}
        <Header />

        {isIntakeCompleted ? <HomeDashboard /> : <HomeOnboarding />}
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
  },
});
