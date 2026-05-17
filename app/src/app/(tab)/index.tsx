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

export default function HomeScreen() {

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Section */}
        <View style={styles.headerRow}>
          <View style={{ width: 68 }} /> {/* Spacing placeholder to keep title centered */}
          <Text style={styles.headerTitle}>Body Axis™</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

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
              <Feather name="zap" size={14} color="#00F2FE" style={{ marginRight: 6 }} />
              <Text style={styles.quickActionLabel}>QUICK ACTION</Text>
            </View>
            <Text style={styles.quickActionTitle}>Start a Movement Plan</Text>
            <Text style={styles.quickActionSubtitle}>
              Pick an area, tell us how it feels, and we will build your plan.
            </Text>
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.85}>
              <Text style={styles.quickActionButtonText}>Get Started  →</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Tracker Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressHeaderLeft}>
                <Feather name="calendar" size={18} color="#00F2FE" style={{ marginRight: 8 }} />
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
              <Feather name="more-horizontal" size={20} color="#8A99AD" />
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
                  <Feather name="target" size={18} color="#00F2FE" />
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
                  <Feather name="activity" size={18} color="#00F2FE" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00F2FE',
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0C1524',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2E44',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#00F2FE',
  },
  heroContainer: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    color: '#00F2FE',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#8A99AD',
    lineHeight: 20,
    marginTop: 10,
  },
  quickActionCard: {
    marginHorizontal: 24,
    backgroundColor: '#0C1524',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
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
    color: '#00F2FE',
    letterSpacing: 0.8,
  },
  quickActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#8A99AD',
    lineHeight: 18,
    marginBottom: 20,
  },
  quickActionButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  progressCard: {
    marginHorizontal: 24,
    backgroundColor: '#0C1524',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
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
    color: '#FFFFFF',
  },
  progressHeaderRight: {
    flexDirection: 'row',
    gap: 16,
  },
  progressStat: {
    fontSize: 12,
    color: '#8A99AD',
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
    backgroundColor: '#050B14',
    borderWidth: 1,
    borderColor: '#1E2E44',
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
    color: '#FFFFFF',
  },
  horizontalScrollContent: {
    paddingLeft: 24,
    paddingRight: 12,
    marginBottom: 28,
  },
  planCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#0C1524',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
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
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  planCategory: {
    fontSize: 12,
    color: '#8A99AD',
  },
  methodologyCard: {
    marginHorizontal: 24,
    backgroundColor: '#0C1524',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
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
    color: '#00F2FE',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  methodologyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#050B14',
    borderWidth: 1,
    borderColor: '#1E2E44',
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
    color: '#FFFFFF',
    marginBottom: 6,
  },
  methodologyRowDesc: {
    fontSize: 13,
    color: '#8A99AD',
    lineHeight: 18,
  },
});
