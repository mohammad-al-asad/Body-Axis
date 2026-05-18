import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/redux/slice/settings';
import { logout } from '@/redux/slice/auth';
import { RootState } from '@/redux/store';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const currentThemeMode = useSelector((state: RootState) => state.settings.theme);
  const theme = useTheme();
  const styles = createStyles(theme);

  // Profile data states for interactive updates
  const [height, setHeight] = useState(174);
  const [weight, setWeight] = useState(75);

  const handleUpdateHeight = () => {
    Alert.prompt(
      'Update Height',
      'Enter your height in centimeters (cm):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (val) => {
            const num = parseInt(val || '', 10);
            if (!isNaN(num) && num > 50 && num < 300) {
              setHeight(num);
            } else {
              Alert.alert('Invalid Entry', 'Please enter a valid height between 50 and 300 cm.');
            }
          },
        },
      ],
      'plain-text',
      height.toString()
    );
  };

  const handleUpdateWeight = () => {
    Alert.prompt(
      'Update Weight',
      'Enter your weight in kilograms (kg):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (val) => {
            const num = parseInt(val || '', 10);
            if (!isNaN(num) && num > 10 && num < 500) {
              setWeight(num);
            } else {
              Alert.alert('Invalid Entry', 'Please enter a valid weight between 10 and 500 kg.');
            }
          },
        },
      ],
      'plain-text',
      weight.toString()
    );
  };

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
    Alert.alert(
      'Change Password',
      'Redirecting to the set-password screen...',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            router.push('/(auth)/set-password');
          },
        },
      ]
    );
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
            <Text style={styles.mainName}>Jafor Mia</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
            <TouchableOpacity onPress={() => handleEditSection('Personal Information')}>
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
                <Text style={styles.itemValue}>Alexandria Sterling</Text>
              </View>
            </View>

            {/* Email Row */}
            <View style={[styles.cardItemRow, styles.rowBorderTop]}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <Feather name="mail" size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Email</Text>
                <Text style={styles.itemValue}>a.sterling@gmail.com</Text>
              </View>
            </View>

            {/* Gender and DOB Columns Grid */}
            <View style={[styles.columnsGrid, styles.rowBorderTop]}>
              <View style={styles.columnBox}>
                <Text style={styles.columnLabel}>Gender</Text>
                <Text style={styles.columnValue}>Female</Text>
              </View>

              <View style={styles.columnBoxRight}>
                <Text style={styles.columnLabel}>DOB</Text>
                <Text style={styles.columnValue}>12 May 1994</Text>
              </View>
            </View>

            {/* Height and Weight Grid with Update Buttons */}
            <View style={[styles.columnsGrid, styles.rowBorderTop]}>
              <View style={styles.columnBox}>
                <Text style={styles.columnLabel}>Height</Text>
                <Text style={styles.columnValue}>{height} <Text style={styles.unitLabel}>cm</Text></Text>
                <TouchableOpacity onPress={handleUpdateHeight} activeOpacity={0.7} style={styles.updateLinkContainer}>
                  <Text style={styles.updateLinkText}>UPDATE</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.columnBoxRight}>
                <Text style={styles.columnLabel}>Weight</Text>
                <Text style={styles.columnValue}>{weight} <Text style={styles.unitLabel}>kgs</Text></Text>
                <TouchableOpacity onPress={handleUpdateWeight} activeOpacity={0.7} style={styles.updateLinkContainer}>
                  <Text style={styles.updateLinkText}>UPDATE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Security */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>SECURITY</Text>
            <TouchableOpacity onPress={() => handleEditSection('Security Settings')}>
              <Feather name="edit-3" size={16} color={theme.secondary} />
            </TouchableOpacity>
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
            <TouchableOpacity onPress={() => handleEditSection('Preference Settings')}>
              <Feather name="edit-3" size={16} color={theme.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {/* Language */}
            <TouchableOpacity style={styles.cardItemRowNoBorder} activeOpacity={0.8} onPress={() => handleEditSection('Language')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                <Feather name="globe" size={16} color="#10B981" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Language</Text>
                <Text style={styles.itemSubtitleOnly}>English (United States)</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Measurement Units */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => handleEditSection('Measurement Units')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.08)' }]}>
                <Feather name="sliders" size={16} color="#8B5CF6" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Measurement Units</Text>
                <Text style={styles.itemSubtitleOnly}>Metric (kg, cm, km)</Text>
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
            <TouchableOpacity style={styles.cardItemRowNoBorder} activeOpacity={0.8} onPress={() => handleEditSection('Subscription Management')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <Feather name="shield" size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Subscription Management</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => handleEditSection('Notification Settings')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <Feather name="bell" size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Notification Settings</Text>
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
              <Switch
                value={currentThemeMode === 'dark'}
                onValueChange={() => dispatch(toggleTheme())}
                trackColor={{ false: '#334155', true: theme.secondary }}
                thumbColor='#F1F5F9'
              />
            </View>

            {/* Sign Out */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={handleSignOut}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
                <Feather name="log-out" size={16} color="#EF4444" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitleOnly, { color: '#EF4444' }]}>Sign Out</Text>
                <Text style={styles.itemSubtitleOnly}>Exit your active session</Text>
              </View>
              <Feather name="log-out" size={16} color="#EF4444" />
            </TouchableOpacity>

            {/* Terminate Account */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={handleTerminateAccount}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
                <Feather name="user-x" size={16} color="#EF4444" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitleOnly, { color: '#EF4444' }]}>Terminate Account</Text>
                <Text style={styles.itemSubtitleOnly}>Permanently delete all data</Text>
              </View>
              <Feather name="alert-triangle" size={16} color="#EF4444" />
            </TouchableOpacity>
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
      paddingBottom: 40,
    },
    avatarPanel: {
      alignItems: 'center',
      marginTop: 18,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 2,
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
  });
