import { Image } from 'expo-image';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme, useThemeState } from '@/hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';

export function HomeOnboarding() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      
      {/* Hero Image Section */}
      <View style={styles.heroImageContainer}>
        <Image
          source={require('@/assets/images/app/homeHero.png')}
          style={styles.heroImage}
          contentFit="cover"
        />

        {/* Smooth multi-stop linear gradient for text readability and background blend */}
        <LinearGradient
          colors={[
            'transparent', 
            themeState === 'light' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(5, 11, 20, 0.2)', 
            themeState === 'light' ? 'rgba(255, 255, 255, 0.85)' : theme.background, 
            theme.background
          ]}
          locations={[0, 0.7, 0.8, 1.0]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Hero Centered Wording */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Welcome to Body Axis.</Text>
          <Text style={styles.heroSubtitle}>
            Let's build your personalized movement plan so you can move better, feel better, live better.
          </Text>
        </View>
      </View>

      {/* Initialization Card */}
      <View style={styles.initializationCard}>
        <View style={styles.initializationInfo}>
          <Text style={styles.initializationLabel}>INITIALIZATION</Text>
          <Text style={styles.initializationTitle}>Build Your First Plan</Text>
        </View>
        <TouchableOpacity
          style={styles.getStartedButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(intake)')}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorksContainer}>
        <View style={styles.howItWorksHeader}>
          <Text style={styles.howItWorksTitle}>How it works</Text>
          <View style={styles.howItWorksLine} />
        </View>

        {/* Step 1 */}
        <View style={styles.stepCard}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Text style={styles.stepTitle}>Choose Area</Text>
          <Text style={styles.stepDescription}>
            Select the areas you want to focus on.
          </Text>
        </View>

        {/* Step 2 */}
        <View style={styles.stepCard}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={styles.stepTitle}>How It Feels</Text>
          <Text style={styles.stepDescription}>
            Tell us how it feels and what you're experiencing.
          </Text>
        </View>

        {/* Step 3 */}
        <View style={styles.stepCard}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepTitle}>Get Plan</Text>
          <Text style={styles.stepDescription}>
            Change wording below: Get personalized plans with steps you can follow.
          </Text>
        </View>
      </View>

      {/* Our Methodology Section */}
      <Text style={styles.methodologySectionTitle}>Our Methodology</Text>
      <View style={styles.methodologyCard}>
        <View style={styles.pillsRow}>
          <View style={styles.resetPill}>
            <Text style={styles.resetPillText}>RESET</Text>
          </View>
          <View style={styles.controlPill}>
            <Text style={styles.controlPillText}>CONTROL</Text>
          </View>
          <View style={styles.integratePill}>
            <Text style={styles.integratePillText}>INTEGRATE</Text>
          </View>
        </View>

        <Text style={styles.methodologyText}>
          The Body Axis™ approach is built on three pillars of performance science. We first{' '}
          <Text style={styles.resetHighlight}>Reset</Text> the nervous system to eliminate compensation patterns, then establish{' '}
          <Text style={styles.controlHighlight}>Control</Text> over specific movement ranges, and finally{' '}
          <Text style={styles.integrateHighlight}>Integrate</Text> these gains into high-performance movement patterns.
        </Text>

        <View style={styles.methodologySubCards}>
          <View style={styles.subCard}>
            <Image
              source={require('@/assets/images/icons/mechanicalArm.png')}
              style={[styles.subCardIcon, { tintColor: theme.secondary }]}
            />
            <Text style={styles.subCardText}>Biometric Precision</Text>
          </View>
          <View style={styles.subCard}>
            <Image
              source={require('@/assets/images/icons/brain.png')}
              style={[styles.subCardIcon, { tintColor: theme.secondary }]}
            />
            <Text style={styles.subCardText}>Neural Focus</Text>
          </View>
        </View>
      </View>

      {/* Explore Plans Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore Plans</Text>
        <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View all</Text>
          <Feather name="chevron-right" size={14} color={theme.secondary} style={{ marginLeft: 2 }} />
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
              <Text style={styles.durationText}>12 MIN</Text>
            </View>
            <View style={styles.playButton}>
              <Feather name="play" size={12} color="#050B14" style={{ marginLeft: 2 }} />
            </View>
          </View>
          <Text style={styles.planTitle} numberOfLines={2}>Lower Back Decompression</Text>
          <Text style={styles.planCategory}>Focus: Spinal Mobility & Relief</Text>
        </TouchableOpacity>

        {/* Plan Card B */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
          <View style={styles.planImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80' }}
              style={styles.planImage}
            />
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>14 MIN</Text>
            </View>
            <View style={styles.playButton}>
              <Feather name="play" size={12} color="#050B14" style={{ marginLeft: 2 }} />
            </View>
          </View>
          <Text style={styles.planTitle} numberOfLines={2}>Hip Capsule Flow</Text>
          <Text style={styles.planCategory}>Focus: Functional Range & Mobility</Text>
        </TouchableOpacity>

        {/* Plan Card C */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
          <View style={styles.planImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80' }}
              style={styles.planImage}
            />
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>15 MIN</Text>
            </View>
            <View style={styles.playButton}>
              <Feather name="play" size={12} color="#050B14" style={{ marginLeft: 2 }} />
            </View>
          </View>
          <Text style={styles.planTitle} numberOfLines={2}>Spinal Articulation</Text>
          <Text style={styles.planCategory}>Focus: Nervous System Integration</Text>
        </TouchableOpacity>
      </ScrollView>

    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) => StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: theme.background,
  },
  heroImageContainer: {
    width: '100%',
    height: 410,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '90%',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: themeState === 'light' ? '#050B14' : '#ffffff',
    marginBottom: 6,
    textShadowColor: themeState === 'light' ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: themeState === 'light' ? '#4B5563' : '#ffffff',
    lineHeight: 20,
    opacity: themeState === 'light' ? 1 : 0.9,
    textShadowColor: themeState === 'light' ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  initializationCard: {
    borderRadius: 16,
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder !== 'transparent' ? theme.cardBorder : theme.inputBorder,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  initializationInfo: {
    flex: 1,
    marginRight: 12,
  },
  initializationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.secondary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  initializationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    lineHeight: 22,
  },
  getStartedButton: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  howItWorksContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  howItWorksTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
    marginRight: 16,
  },
  howItWorksLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.inputBorder,
  },
  stepCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder !== 'transparent' ? theme.cardBorder : theme.inputBorder,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: themeState === 'dark' ? '#050B14' : '#E0E1E6',
    borderWidth: 1.5,
    borderColor: theme.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.secondary,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  methodologySectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  methodologyCard: {
    marginHorizontal: 16,
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder !== 'transparent' ? theme.cardBorder : theme.inputBorder,
    padding: 20,
    marginBottom: 28,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  resetPill: {
    backgroundColor: themeState === 'dark' ? '#2E1A3C' : '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resetPillText: {
    color: themeState === 'dark' ? '#D67BFF' : '#A855F7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  controlPill: {
    backgroundColor: themeState === 'dark' ? '#0D2D35' : '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  controlPillText: {
    color: themeState === 'dark' ? '#62FAE3' : '#0D9488',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  integratePill: {
    backgroundColor: themeState === 'dark' ? '#162C4E' : '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  integratePillText: {
    color: themeState === 'dark' ? '#ADC6FF' : '#2563EB',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  methodologyText: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  resetHighlight: {
    color: themeState === 'dark' ? '#D67BFF' : '#A855F7',
    fontWeight: '800',
  },
  controlHighlight: {
    color: themeState === 'dark' ? '#62FAE3' : '#0D9488',
    fontWeight: '800',
  },
  integrateHighlight: {
    color: themeState === 'dark' ? '#ADC6FF' : '#2563EB',
    fontWeight: '800',
  },
  methodologySubCards: {
    flexDirection: 'row',
    gap: 12,
  },
  subCard: {
    flex: 1,
    backgroundColor: themeState === 'dark' ? '#070C15' : '#E0E1E6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.inputBorder,
  },
  subCardIcon: {
    width: 20,
    height: 20,
    marginBottom: 6,
  },
  subCardText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: theme.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 28,
  },
  planCard: {
    width: 240,
    marginRight: 16,
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.cardBorder !== 'transparent' ? theme.cardBorder : theme.inputBorder,
  },
  planImageContainer: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  planImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  planCategory: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
});
