import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Real-time joint calibration and mobility stats</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Key Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>STREAK</Text>
              <Text style={styles.statValue}>5 Days</Text>
              <Feather name="award" size={16} color="#00F2FE" style={styles.statIcon} />
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TOTAL TIME</Text>
              <Text style={styles.statValue}>180 Min</Text>
              <Feather name="clock" size={16} color="#208AEF" style={styles.statIcon} />
            </View>
          </View>

          {/* Mobility Index Card */}
          <View style={styles.gaugeCard}>
            <Text style={styles.cardLabel}>MOBILITY CALIBRATION INDEX</Text>
            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeTextWrapper}>
                <Text style={styles.gaugeNumber}>78</Text>
                <Text style={styles.gaugeTextLabel}>Score</Text>
              </View>
              {/* Custom styled semi-circle gauge representation using border styling */}
              <View style={styles.gaugeArc} />
            </View>
            <Text style={styles.gaugeDesc}>
              Great work! Your hips and spine are calibrated 14% higher than last week. Keep moving pain-free.
            </Text>
          </View>

          {/* Activity Graph Section */}
          <View style={styles.graphCard}>
            <Text style={styles.cardLabel}>WEEKLY MOVEMENT LOG</Text>
            <View style={styles.barGraphRow}>
              {[
                { day: 'Mon', val: 36 },
                { day: 'Tue', val: 54 },
                { day: 'Wed', val: 77 },
                { day: 'Thu', val: 45 },
                { day: 'Fri', val: 86 },
                { day: 'Sat', val: 27 },
                { day: 'Sun', val: 68 },
              ].map((item, idx) => (
                <View key={item.day} style={styles.graphColumn}>
                  <View style={styles.graphBarTrack}>
                    <View
                      style={[
                        styles.graphBarFill,
                        { height: item.val },
                        idx === 4 && { backgroundColor: '#00F2FE' }, // highlight peak day
                      ]}
                    />
                  </View>
                  <Text style={styles.graphDayText}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Session History Log */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Completed Sessions</Text>
            {[
              { id: '1', title: 'Lower Back Decompression', date: 'Yesterday', dur: '15 mins', score: '+4 Axis' },
              { id: '2', title: 'Hip Opener Flow', date: '3 days ago', dur: '12 mins', score: '+3 Axis' },
              { id: '3', title: 'Thoracic Extension Practice', date: 'Last week', dur: '8 mins', score: '+2 Axis' },
            ].map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <View style={styles.historyIconWrapper}>
                  <Feather name="check" size={16} color="#00F2FE" />
                </View>
                <View style={styles.historyTextWrapper}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyDesc}>
                    {item.date} • {item.dur}
                  </Text>
                </View>
                <Text style={styles.historyScore}>{item.score}</Text>
              </View>
            ))}
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
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8A99AD',
    marginTop: 6,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0C1524',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
    position: 'relative',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A99AD',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  gaugeCard: {
    marginHorizontal: 24,
    backgroundColor: '#0C1524',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00F2FE',
    letterSpacing: 1,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  gaugeContainer: {
    width: 140,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  gaugeArc: {
    position: 'absolute',
    top: 0,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#208AEF',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  gaugeTextWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  gaugeNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gaugeTextLabel: {
    fontSize: 12,
    color: '#8A99AD',
    fontWeight: '500',
  },
  gaugeDesc: {
    fontSize: 13,
    color: '#8A99AD',
    textAlign: 'center',
    lineHeight: 18,
  },
  graphCard: {
    marginHorizontal: 24,
    backgroundColor: '#0C1524',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
    marginBottom: 28,
  },
  barGraphRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 12,
  },
  graphColumn: {
    alignItems: 'center',
    flex: 1,
  },
  graphBarTrack: {
    width: 10,
    height: 90,
    borderRadius: 5,
    backgroundColor: '#050B14',
    overflow: 'hidden',
    marginBottom: 8,
  },
  graphBarFill: {
    width: '100%',
    backgroundColor: '#208AEF',
    borderRadius: 5,
    position: 'absolute',
    bottom: 0,
  },
  graphDayText: {
    fontSize: 10,
    color: '#8A99AD',
    fontWeight: '600',
  },
  historySection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1524',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
    marginBottom: 12,
  },
  historyIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#050B14',
    borderWidth: 1,
    borderColor: '#1E2E44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyTextWrapper: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  historyDesc: {
    fontSize: 12,
    color: '#8A99AD',
  },
  historyScore: {
    fontSize: 13,
    color: '#00F2FE',
    fontWeight: '700',
  },
});
