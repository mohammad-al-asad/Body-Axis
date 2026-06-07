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
import { BlurView } from 'expo-blur';

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
          source={require('@/assets/images/avatar/femaleFront.png')}
          style={styles.heroImage}
          contentFit="cover"
        />
        
        {/* Absolute Overlay Circles (Body Axis Targets) */}
        {/* Right shoulder area */}
        <View style={[styles.targetDot, { top: '23%', right: '35%' }]}>
          <View style={styles.targetDotOuter} />
          <View style={styles.targetDotInner} />
        </View>

        {/* Left hip/pelvis area */}
        <View style={[styles.targetDot, { top: '42%', left: '38%' }]}>
          <View style={styles.targetDotOuter} />
          <View style={styles.targetDotInner} />
        </View>

        {/* Dark linear gradient bottom to top for text readability and smooth background blend */}
        <LinearGradient
          colors={['transparent', theme.background === '#ffffff' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(5, 11, 20, 0.45)', theme.background]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Hero Centered Wording */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitleCentered}>
            Welcome to Body Axis. Let's build your personalized movement plan so you can move better, feel better, live better.
          </Text>
        </View>

        {/* Floating Action Card with native BlurView */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 25 : 30}
          tint="prominent"
          style={styles.initializationCard}>
          <View style={styles.initializationInfo}>
            <Text style={styles.initializationLabel}>INITIALIZATION</Text>
            <Text style={styles.initializationTitle}>Build Your First Plan Now</Text>
          </View>
          <TouchableOpacity
            style={styles.getStartedButton}
            activeOpacity={0.8}
            onPress={() => router.push('/(intake)')}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </BlurView>
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
            Get personalized plans with steps you can follow.
          </Text>
        </View>
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
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) => StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  heroImageContainer: {
    width: '100%',
    height: 520,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 30,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  targetDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  targetDotOuter: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.secondary,
    opacity: 0.65,
  },
  targetDotInner: {
    width: 10,
    height: 10,
    borderRadius: 100,
    backgroundColor: theme.secondary,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 5,
  },
  heroTitleCentered: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeState === 'light' ? '#050B14' : '#ffffff',
    textAlign: 'left',
    lineHeight: 26,
  },
  initializationCard: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 16,
    borderRadius: 16,
    backgroundColor: themeState === 'dark' ? 'rgba(0, 9, 28, 0.7)' : 'rgba(211, 211, 211, 0.7)',
    borderWidth: 0,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
    overflow: 'hidden',
  },
  initializationInfo: {
    flex: 1,
    marginRight: 12,
  },
  initializationLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.secondary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  initializationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeState === 'light' ? '#050B14' : '#ffffff',
    width: 150,
  },
  getStartedButton: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  howItWorksContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  howItWorksTitle: {
    fontSize: 22,
    fontWeight: '700',
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  stepBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(93, 230, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(93, 230, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.secondary,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressCard: {
    marginHorizontal: 24,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 28,
    elevation: 1,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginTop: 8,
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
    marginTop: 12,
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
    elevation: 1,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    elevation: 1,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
