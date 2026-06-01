import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/redux/slice/settings';
import { logout } from '@/redux/slice/auth';
import { RootState } from '@/redux/store';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { router, useNavigation } from 'expo-router';
import { CustomSwitch } from '@/components/ui/CustomSwitch';
import { CustomSheet } from '@/components/ui/CustomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languageOptions = [
  { label: 'English (United States)', value: 'en' },
  { label: 'Spanish (Español)', value: 'es' },
  { label: 'French (Français)', value: 'fr' },
  { label: 'German (Deutsch)', value: 'de' },
];

const measurementOptions = [
  { label: 'Metric (kg, cm, km)', value: 'metric' },
  { label: 'Imperial (lbs, in, mi)', value: 'imperial' },
];

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const currentThemeMode = useSelector((state: RootState) => state.settings.theme);
  const theme = useTheme();
  const styles = createStyles(theme);

  // Profile data states for interactive updates
  const [name, setName] = useState('Alexandria Sterling');
  const [gender, setGender] = useState('Female');
  const [dob, setDob] = useState('12 May 1994');
  const [height, setHeight] = useState(174);
  const [weight, setWeight] = useState(75);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showMeasurementPicker, setShowMeasurementPicker] = useState(false);
  const [measurementUnit, setMeasurementUnit] = useState('metric');

  const navigation = useNavigation();

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('@user_profile');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.name) setName(data.name);
        if (data.gender) setGender(data.gender);
        if (data.dob) setDob(data.dob);
        if (data.height) setHeight(Number(data.height));
        if (data.weight) setWeight(Number(data.weight));
      }
    } catch (e) {
      console.log('Failed to load profile data', e);
    }
  };

  useEffect(() => {
    loadProfile();
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const selectedLanguageLabel = languageOptions.find((option) => option.value === language)?.label || 'English (United States)';
  const selectedMeasurementLabel = measurementOptions.find((option) => option.value === measurementUnit)?.label || 'Metric (kg, cm, km)';



  const handleEditSection = (section: string) => {
    Alert.alert('Edit Information', `Would you like to edit your ${section} settings?`);
  };

  const handleExportData = () => {
    Alert.alert('Data Export', 'Your fitness history and calibration logs have been exported. Check your email for a copy.');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const handleTerminateAccount = () => {
    Alert.alert(
      'Terminate Account',
      'Are you absolutely sure you want to permanently delete your account? All biometric data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your profile has been terminated.');
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    router.push('/(profile)/change-password');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Unified Header */}
        <Header />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Large Avatar and Name Panel */}
          <View style={styles.avatarPanel}>
            <View style={styles.avatarGlowBorder}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                }}
                style={styles.largeAvatar}
              />
              <TouchableOpacity style={styles.avatarEditOverlay} activeOpacity={0.85} onPress={() => handleEditSection('Profile Picture')}>
                <Feather name="edit-2" size={10} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.mainName}>{name}</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
            <TouchableOpacity onPress={() => router.push('/(profile)/edit-profile')}>
              <Feather name="edit-3" size={16} color={theme.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {/* Name Row */}
            <View style={styles.cardItemRow}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <Feather name="user" size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Name</Text>
                <Text style={styles.itemValue}>{name}</Text>
              </View>
            </View>

            {/* Gender and DOB Columns Grid */}
            <View style={[styles.columnsGrid, styles.rowBorderTop]}>
              <View style={styles.columnBox}>
                <Text style={styles.columnLabel}>Gender</Text>
                <Text style={styles.columnValue}>{gender}</Text>
              </View>

              <View style={styles.columnBoxRight}>
                <Text style={styles.columnLabel}>DOB</Text>
                <Text style={styles.columnValue}>{dob}</Text>
              </View>
            </View>

            {/* Height and Weight Grid with Update Buttons */}
            <View style={[styles.columnsGrid, styles.rowBorderTop]}>
              <View style={styles.columnBox}>
                <Text style={styles.columnLabel}>Height</Text>
                <Text style={styles.columnValue}>
                  {measurementUnit === 'metric' ? height : Math.round(height / 2.54)}{' '}
                  <Text style={styles.unitLabel}>{measurementUnit === 'metric' ? 'cm' : 'in'}</Text>
                </Text>
              </View>

              <View style={styles.columnBoxRight}>
                <Text style={styles.columnLabel}>Weight</Text>
                <Text style={styles.columnValue}>
                  {measurementUnit === 'metric' ? weight : Math.round(weight * 2.20462)}{' '}
                  <Text style={styles.unitLabel}>{measurementUnit === 'metric' ? 'kgs' : 'lbs'}</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Security */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>SECURITY</Text>
          </View>

          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={handleChangePassword}>
            <View style={styles.cardItemRowNoBorder}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]}>
                <Feather name="lock" size={16} color="#3B82F6" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Change Password</Text>
                <Text style={styles.itemSubtitleOnly}>Last changed 3 months ago</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Preferences */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>PREFERENCES</Text>

          </View>

          <View style={styles.card}>
            {/* Language */}
            <TouchableOpacity style={styles.cardItemRow} activeOpacity={0.8} onPress={() => setShowLanguagePicker(true)}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                <Feather name="globe" size={16} color="#10B981" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Language</Text>
                <Text style={styles.itemSubtitleOnly}>{selectedLanguageLabel}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Measurement Units */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => setShowMeasurementPicker(true)}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <MaterialCommunityIcons name="ruler" size={20} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Measurement Units</Text>
                <Text style={styles.itemSubtitleOnly}>{selectedMeasurementLabel}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Account Systems */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>ACCOUNT SYSTEMS</Text>
          </View>

          <View style={styles.card}>
            {/* Subscription */}
            <TouchableOpacity style={styles.cardItemRowNoBorder} activeOpacity={0.8} onPress={() => router.push('/(profile)/subscription')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <Feather name="shield" size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Subscription Management</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => router.push('/(profile)/notifications')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <Feather name="bell" size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Notification Settings</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Legal & Support */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>LEGAL & SUPPORT</Text>
          </View>

          <View style={styles.card}>
            {/* Privacy Policy */}
            <TouchableOpacity style={styles.cardItemRowNoBorder} activeOpacity={0.8} onPress={() => router.push('/(profile)/privacy')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(98, 250, 227, 0.08)' }]}>
                <Feather name="shield" size={16} color={theme.quaternary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Privacy Policy</Text>
                <Text style={styles.itemSubtitleOnly}>Your data safety & privacy rules</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Terms of Service */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => router.push('/(profile)/terms')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(98, 250, 227, 0.08)' }]}>
                <Feather name="file-text" size={16} color={theme.quaternary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Terms of Service</Text>
                <Text style={styles.itemSubtitleOnly}>Usage agreement & rules</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Support & FAQ */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => router.push('/(profile)/support')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(98, 250, 227, 0.08)' }]}>
                <Feather name="help-circle" size={16} color={theme.quaternary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Support & FAQ</Text>
                <Text style={styles.itemSubtitleOnly}>Frequently asked questions & help</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Management */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>MANAGEMENT</Text>
          </View>

          <View style={styles.card}>
            {/* Export Data */}
            <TouchableOpacity style={styles.cardItemRowNoBorder} activeOpacity={0.8} onPress={handleExportData}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(100, 116, 139, 0.08)' }]}>
                <Feather name="download" size={16} color="#64748B" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Export Data</Text>
                <Text style={styles.itemSubtitleOnly}>Request a copy of your fitness records</Text>
              </View>
              <Feather name="download" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Dark Mode */}
            <View style={[styles.cardItemRowNoBorder, styles.rowBorderTop]}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(100, 116, 139, 0.08)' }]}>
                <Feather name="moon" size={16} color="#64748B" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Dark Mode</Text>
              </View>
              <CustomSwitch
                value={currentThemeMode === 'dark'}
                onValueChange={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  dispatch(toggleTheme());
                }}
              />
            </View>

            {/* Terminate Account */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={handleTerminateAccount}>
              <View style={[styles.itemIconBox, { backgroundColor: theme.warningBG }]}>
                <Feather name="user-x" size={16} color={theme.warning} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitleOnly, { color: theme.warning }]}>Terminate Account</Text>
                <Text style={[styles.itemSubtitleOnly,{color: theme.warning}]}>Permanently delete all data</Text>
              </View>
              <Feather name="alert-triangle" size={16} color={theme.warning} />
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutButton} activeOpacity={0.85} onPress={handleSignOut}>
            <Feather name="log-out" size={16} color="#FFFFFF" style={styles.signOutIcon} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>

        <CustomSheet
          visible={showLanguagePicker}
          onClose={() => setShowLanguagePicker(false)}
          title="Select Language"
          options={languageOptions}
          selectedValue={language}
          onSelect={(val) => setLanguage(val)}
        />

        <CustomSheet
          visible={showMeasurementPicker}
          onClose={() => setShowMeasurementPicker(false)}
          title="Select Measurement Unit"
          options={measurementOptions}
          selectedValue={measurementUnit}
          onSelect={(val) => setMeasurementUnit(val)}
        />
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
      paddingBottom: 40,
    },
    avatarPanel: {
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 24,
    },
    avatarGlowBorder: {
      position: 'relative',
      borderRadius: 50,
      padding: 3,
      borderWidth: 2,
      borderColor: theme.secondary,
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    largeAvatar: {
      width: 86,
      height: 86,
      borderRadius: 43,
    },
    avatarEditOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#1E293B',
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainName: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text,
      marginTop: 14,
      letterSpacing: -0.5,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginTop: 24,
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.secondary,
      letterSpacing: 0.8,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      marginHorizontal: 24,
      paddingHorizontal: 20,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    cardItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
    },
    cardItemRowNoBorder: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
    },
    rowBorderTop: {
      borderTopWidth: 1,
      borderTopColor: theme.inputBorder,
    },
    itemIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    itemTextContainer: {
      flex: 1,
    },
    itemLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
      marginBottom: 2,
    },
    itemValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    itemTitleOnly: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    itemSubtitleOnly: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    columnsGrid: {
      flexDirection: 'row',
      paddingVertical: 16,
    },
    columnBox: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: theme.inputBorder,
      paddingRight: 10,
    },
    columnBoxRight: {
      flex: 1,
      paddingLeft: 20,
    },
    columnLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
      marginBottom: 4,
    },
    columnValue: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
    },
    unitLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    updateLinkContainer: {
      marginTop: 6,
    },
    updateLinkText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 0.5,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#DC2626', // Hardcoded red
      borderRadius: 16,
      marginHorizontal: 24,
      marginTop: 24,
      paddingVertical: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    signOutIcon: {
      marginRight: 8,
    },
    signOutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });
