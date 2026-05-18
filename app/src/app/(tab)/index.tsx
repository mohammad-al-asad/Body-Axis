import { Image } from 'expo-image';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CustomButton } from '@/components/ui/CustomButton';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Section */}
        <Header />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          {/* Hero Typography */}
          <View style={styles.heroContainer}>
            <Text style={styles.heroTitle}>
              Move Better <Text style={styles.heroHighlight}>Starting Now.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Your journey to better movement starts today. Unlock your strength and mobility with a custom movement plan built for your body.
            </Text>
          </View>

          {/* Quick Action Card */}
          <View style={styles.quickActionCard}>
            <View style={styles.quickActionHeader}>
              <Feather name="zap" size={14} color={theme.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.quickActionLabel}>QUICK ACTION</Text>
            </View>
            <Text style={styles.quickActionTitle}>Start a Movement Plan</Text>
            <Text style={styles.quickActionSubtitle}>
              Pick an area, tell us how it feels, and we will build your plan.
            </Text>
            <CustomButton
              title="Get Started"
              onPress={() => {}}
            />
          </View>

          {/* Progress Tracker Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressHeaderLeft}>
                <Feather name="calendar" size={18} color={theme.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.progressTitle}>Week 01</Text>
              </View>
              <View style={styles.progressHeaderRight}>
                <Text style={styles.progressStat}>Sets</Text>
                <Text style={styles.progressStat}>Reps</Text>
              </View>
            </View>
            <View style={styles.trackerBoxesRow}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.trackerBox} />
              ))}
            </View>
          </View>

          {/* Suggested Plans Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested Movement Plans</Text>
            <TouchableOpacity>
              <Feather name="more-horizontal" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Swipable Plans Horizontal Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}>
            
            {/* Plan Card A */}
            <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
              <View style={styles.planImageContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80' }}
                  style={styles.planImage}
                />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>15m</Text>
                </View>
              </View>
              <Text style={styles.planTitle} numberOfLines={2}>Lower Back Decompression</Text>
              <Text style={styles.planCategory}>Focused Mobility</Text>
            </TouchableOpacity>

            {/* Plan Card B */}
            <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
              <View style={styles.planImageContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80' }}
                  style={styles.planImage}
                />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>20m</Text>
                </View>
              </View>
              <Text style={styles.planTitle} numberOfLines={2}>Spinal Articulation</Text>
              <Text style={styles.planCategory}>Nervous System</Text>
            </TouchableOpacity>

            {/* Plan Card C */}
            <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
              <View style={styles.planImageContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80' }}
                  style={styles.planImage}
                />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>12m</Text>
                </View>
              </View>
              <Text style={styles.planTitle} numberOfLines={2}>Hip Opening Flow</Text>
              <Text style={styles.planCategory}>Joint Leverage</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* The Methodology Card */}
          <View style={styles.methodologyCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=600&q=80' }}
              style={styles.methodologyImage}
            />
            <View style={styles.methodologyContent}>
              <Text style={styles.methodologyLabel}>THE METHODOLOGY</Text>
              <Text style={styles.methodologyTitle}>Move better. Feel better. Live better.</Text>

              {/* Bullet row A */}
              <View style={styles.methodologyRow}>
                <View style={styles.methodologyIconWrapper}>
                  <Feather name="target" size={18} color={theme.secondary} />
                </View>
                <View style={styles.methodologyTextWrapper}>
                  <Text style={styles.methodologyRowTitle}>Tailored To Your Axis</Text>
                  <Text style={styles.methodologyRowDesc}>
                    We prioritize precision. Every plan is calculated to improve your functional range based on joint leverage and muscle elasticity.
                  </Text>
                </View>
              </View>

              {/* Bullet row B */}
              <View style={styles.methodologyRow}>
                <View style={styles.methodologyIconWrapper}>
                  <Feather name="activity" size={18} color={theme.secondary} />
                </View>
                <View style={styles.methodologyTextWrapper}>
                  <Text style={styles.methodologyRowTitle}>Kinetic Flow Integration</Text>
                  <Text style={styles.methodologyRowDesc}>
                    Movements are designed to transition smoothly, increasing blood flow and neural readiness for immediate flexibility gains.
                  </Text>
                </View>
              </View>
            </View>
          </View>

        </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    color: theme.secondary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
  quickActionCard: {
    marginHorizontal: 24,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 24,
  },
  quickActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.secondary,
    letterSpacing: 0.8,
  },
  quickActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  progressCard: {
    marginHorizontal: 24,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 28,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  progressHeaderRight: {
    flexDirection: 'row',
    gap: 16,
  },
  progressStat: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  trackerBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  trackerBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.inputBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  horizontalScrollContent: {
    paddingLeft: 24,
    paddingRight: 12,
    marginBottom: 28,
  },
  planCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  planImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  planImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(5, 11, 20, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  planCategory: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  methodologyCard: {
    marginHorizontal: 24,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    marginBottom: 24,
  },
  methodologyImage: {
    width: '100%',
    height: 200,
  },
  methodologyContent: {
    padding: 24,
  },
  methodologyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.secondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  methodologyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    lineHeight: 26,
    marginBottom: 24,
  },
  methodologyRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  methodologyIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodologyTextWrapper: {
    flex: 1,
  },
  methodologyRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 6,
  },
  methodologyRowDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
});
