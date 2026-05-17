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
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/redux/slice/settings';
import { RootState } from '@/redux/store';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.settings.theme);

  const handleLogout = () => {
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Profile Header Card */}
          <View style={styles.profileHeaderCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }}
              style={styles.avatarLarge}
            />
            <Text style={styles.profileName}>Sarah Jenkins</Text>
            <Text style={styles.profileBio}>Mobility Level: Intermediate</Text>
          </View>

          {/* Physical Axis Metrics */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Physical Axis Metrics</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Feather name="user" size={16} color="#00F2FE" style={styles.metricIcon} />
              <Text style={styles.metricLabel}>GENDER</Text>
              <Text style={styles.metricValue}>Female</Text>
            </View>
            <View style={styles.metricItem}>
              <Feather name="crosshair" size={16} color="#00F2FE" style={styles.metricIcon} />
              <Text style={styles.metricLabel}>PAIN FOCUS</Text>
              <Text style={styles.metricValue}>Lower Back</Text>
            </View>
            <View style={styles.metricItem}>
              <Feather name="activity" size={16} color="#00F2FE" style={styles.metricIcon} />
              <Text style={styles.metricLabel}>GOAL</Text>
              <Text style={styles.metricValue}>Alignment</Text>
            </View>
          </View>

          {/* Settings / Action List */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => dispatch(toggleTheme())}>
              <View style={styles.menuItemLeft}>
                <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={18} color="#00F2FE" style={styles.menuIcon} />
                <Text style={styles.menuText}>App Theme: {theme === 'dark' ? 'Dark' : 'Light'}</Text>
              </View>
              <Text style={{ color: '#00F2FE', fontSize: 13, fontWeight: '600' }}>Toggle</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <Feather name="edit" size={18} color="#8A99AD" style={styles.menuIcon} />
                <Text style={styles.menuText}>Edit Profile</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#5C6E84" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <Feather name="bell" size={18} color="#8A99AD" style={styles.menuIcon} />
                <Text style={styles.menuText}>Notification Preferences</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#5C6E84" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <Feather name="shield" size={18} color="#8A99AD" style={styles.menuIcon} />
                <Text style={styles.menuText}>Privacy & Security</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#5C6E84" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <Feather name="info" size={18} color="#8A99AD" style={styles.menuIcon} />
                <Text style={styles.menuText}>Terms of Service</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#5C6E84" />
            </TouchableOpacity>

            {/* Logout Trigger */}
            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} activeOpacity={0.8} onPress={handleLogout}>
              <View style={styles.menuItemLeft}>
                <Feather name="log-out" size={18} color="#FF4D4D" style={styles.menuIcon} />
                <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
              </View>
            </TouchableOpacity>
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
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#0C1524',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2E44',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: '#00F2FE',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  profileBio: {
    fontSize: 13,
    color: '#8A99AD',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 28,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#0C1524',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
    position: 'relative',
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A99AD',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuSection: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C1524',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
    marginTop: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutItem: {
    borderColor: 'rgba(255, 77, 77, 0.15)',
    marginTop: 20,
  },
  logoutText: {
    color: '#FF4D4D',
  },
});
