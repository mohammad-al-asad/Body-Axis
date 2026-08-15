import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { useGetContentPageQuery } from '@/redux/api/contentApi';

export default function PrivacyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);
  const { data, isLoading, isError } = useGetContentPageQuery('privacy');

  const updatedAt = data?.updated_at
    ? new Date(data.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not available';
  const paragraphs = (data?.content || '').split(/\n{2,}/).filter(Boolean);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onBackPress={() => router.back()} showNotification={false} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{data?.title || 'Privacy Policy'}</Text>
          <Text style={styles.subtitle}>Last updated: {updatedAt}</Text>

          <View style={styles.card}>
            {isLoading ? (
              <ActivityIndicator color={theme.secondary} />
            ) : isError ? (
              <Text style={styles.bodyText}>Unable to load privacy policy right now.</Text>
            ) : (
              paragraphs.map((paragraph, index) => (
                <Text key={`${index}-${paragraph.slice(0, 12)}`} style={styles.bodyText}>
                  {paragraph}
                </Text>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 15,
      paddingBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginTop: 12,
      marginBottom: 4,
      marginLeft: 10,
      letterSpacing: -0.5,
    },
    subtitle: {
      marginLeft: 10,
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 24,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 18,
      marginBottom: 16,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    bodyText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
      marginBottom: 14,
    },
  });
