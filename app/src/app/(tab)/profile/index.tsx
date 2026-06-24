import { Image } from 'expo-image';
import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/redux/slice/settings';
import { logout } from '@/redux/slice/auth';
import { RootState } from '@/redux/store';
import { 
  useDeleteAccountMutation, 
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation
} from '@/redux/api/userApi';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { router, useNavigation } from 'expo-router';
import { CustomSwitch } from '@/components/ui/CustomSwitch';
import { CustomSheet } from '@/components/ui/CustomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const genderOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
];

const languageOptions = [
  { label: 'English (United States)', value: 'en' },
];

const measurementOptions = [
  { label: 'Metric (kg, cm, km)', value: 'metric' },
  { label: 'Imperial (lbs, in, mi)', value: 'imperial' },
];

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const currentThemeMode = useSelector((state: RootState) => state.settings.theme);
  const user = useSelector((state: RootState) => state.auth.user);
  useGetProfileQuery();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const theme = useTheme();
  const styles = createStyles(theme);

  // Profile data states for interactive updates
  const [name, setName] = useState('Alexandria Sterling');
  const [gender, setGender] = useState('Female');
  const [dob, setDob] = useState('12 May 1994');
  const [height, setHeight] = useState(174);
  const [weight, setWeight] = useState(75);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Edit Profile Modal States
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const editProfileSlideAnim = useRef(new Animated.Value(600)).current;
  const editProfileBackdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEditProfileVisible) {
      setShowEditProfileModal(true);
      Animated.parallel([
        Animated.timing(editProfileSlideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(editProfileBackdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(editProfileSlideAnim, {
          toValue: 600,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(editProfileBackdropOpacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowEditProfileModal(false);
      });
    }
  }, [isEditProfileVisible]);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGender, setEditGender] = useState('female');
  const [editDob, setEditDob] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [showEditGenderPicker, setShowEditGenderPicker] = useState(false);

  // Change Password Modal States
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const changePasswordSlideAnim = useRef(new Animated.Value(600)).current;
  const changePasswordBackdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isChangePasswordVisible) {
      setShowChangePasswordModal(true);
      Animated.parallel([
        Animated.timing(changePasswordSlideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(changePasswordBackdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(changePasswordSlideAnim, {
          toValue: 600,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(changePasswordBackdropOpacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowChangePasswordModal(false);
      });
    }
  }, [isChangePasswordVisible]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleOpenEditProfile = () => {
    setEditName(user?.full_name || name);
    setEditEmail(user?.email || '');
    setEditGender(user?.gender || gender.toLowerCase());
    setEditDob(user?.date_of_birth || dob);
    setEditHeight(user?.height_cm ? String(user.height_cm) : String(height));
    setEditWeight(user?.weight_kg ? String(user.weight_kg) : String(weight));
    setIsEditProfileVisible(true);
  };

  const handleOpenChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setIsChangePasswordVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(editEmail.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!editDob.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(editDob.trim())) {
      Alert.alert('Validation Error', 'Please enter date of birth as YYYY-MM-DD.');
      return;
    }

    const heightNum = parseInt(editHeight, 10);
    if (isNaN(heightNum) || heightNum <= 50 || heightNum >= 300) {
      Alert.alert('Validation Error', 'Please enter a valid height between 50 and 300 cm.');
      return;
    }

    const weightNum = parseInt(editWeight, 10);
    if (isNaN(weightNum) || weightNum <= 10 || weightNum >= 500) {
      Alert.alert('Validation Error', 'Please enter a valid weight between 10 and 500 kg.');
      return;
    }

    try {
      await updateProfile({
        full_name: editName.trim(),
        email: editEmail.trim(),
        gender: editGender,
        date_of_birth: editDob.trim(),
        height_cm: heightNum,
        weight_kg: weightNum,
      }).unwrap();
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditProfileVisible(false);
      
      await AsyncStorage.setItem(
        '@user_profile',
        JSON.stringify({
          name: editName.trim(),
          gender: editGender,
          dob: editDob.trim(),
          height: heightNum,
          weight: weightNum,
        })
      );
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Validation Error', 'Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      }).unwrap();
      Alert.alert('Success', 'Your password has been changed successfully.');
      setIsChangePasswordVisible(false);
    } catch (error) {
      console.error('Failed to update password', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    }
  };
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

  const displayName = user?.full_name || name;
  const displayGender = user?.gender
    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
    : gender;

  const formatDob = (dobString: string | null) => {
    if (!dobString) return dob;
    try {
      const date = new Date(dobString);
      if (isNaN(date.getTime())) return dobString;
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dobString;
    }
  };
  const displayDob = user?.date_of_birth ? formatDob(user.date_of_birth) : dob;

  const selectedLanguageLabel = languageOptions.find((option) => option.value === language)?.label || 'English (United States)';
  const selectedMeasurementLabel = measurementOptions.find((option) => option.value === measurementUnit)?.label || 'Metric (kg, cm, km)';



  const handleEditSection = (section: string) => {
    Alert.alert('Edit Information', `Would you like to edit your ${section} settings?`);
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
            router.replace('/auth/sign-in');
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
          onPress: async () => {
            try {
              await deleteAccount().unwrap();
              dispatch(logout());
              Alert.alert('Account Deleted', 'Your profile has been terminated.');
              router.replace('/auth/sign-in');
            } catch (error) {
              console.error('Failed to delete account', error);
              Alert.alert('Error', 'Could not delete your account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    handleOpenChangePassword();
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
            <Text style={styles.mainName}>{displayName}</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
            <TouchableOpacity onPress={handleOpenEditProfile}>
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
                <Text style={styles.itemValue}>{displayName}</Text>
              </View>
            </View>

            {/* Email Row */}
            {user?.email && (
              <View style={[styles.cardItemRow, styles.rowBorderTop]}>
                <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                  <Feather name="mail" size={16} color={theme.secondary} />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemLabel}>Email</Text>
                  <Text style={styles.itemValue}>{user.email}</Text>
                </View>
              </View>
            )}

            {/* Gender and DOB Columns Grid */}
            <View style={[styles.columnsGrid, styles.rowBorderTop]}>
              <View style={styles.columnBox}>
                <Text style={styles.columnLabel}>Gender</Text>
                <Text style={styles.columnValue}>{displayGender}</Text>
              </View>

              <View style={styles.columnBoxRight}>
                <Text style={styles.columnLabel}>DOB</Text>
                <Text style={styles.columnValue}>{displayDob}</Text>
              </View>
            </View>

            {/* Height and Weight Grid with Update Buttons */}
            <View style={[styles.columnsGrid, styles.rowBorderTop]}>
              <View style={styles.columnBox}>
                <Text style={styles.columnLabel}>Height</Text>
                <Text style={styles.columnValue}>
                  {measurementUnit === 'metric'
                    ? user?.height_cm ?? height
                    : Math.round((user?.height_cm ?? height) / 2.54)}{' '}
                  <Text style={styles.unitLabel}>{measurementUnit === 'metric' ? 'cm' : 'in'}</Text>
                </Text>
              </View>

              <View style={styles.columnBoxRight}>
                <Text style={styles.columnLabel}>Weight</Text>
                <Text style={styles.columnValue}>
                  {measurementUnit === 'metric'
                    ? user?.weight_kg ?? weight
                    : Math.round((user?.weight_kg ?? weight) * 2.20462)}{' '}
                  <Text style={styles.unitLabel}>{measurementUnit === 'metric' ? 'kgs' : 'lbs'}</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Account & Security */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>ACCOUNT & SECURITY</Text>
          </View>

          <View style={styles.card}>
            {/* Subscription */}
            <TouchableOpacity style={styles.cardItemRowNoBorder} activeOpacity={0.8} onPress={() => router.push('/profile/subscription')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <Feather name="shield" size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Subscription Management</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => router.push('/profile/notifications')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <Feather name="bell" size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Notification Settings</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Change Password */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.85} onPress={handleChangePassword}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]}>
                <Feather name="lock" size={16} color="#3B82F6" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Change Password</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

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
            <TouchableOpacity style={[styles.cardItemRow, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => setShowMeasurementPicker(true)}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.08)' }]}>
                <MaterialCommunityIcons name="ruler" size={20} color={theme.secondary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Measurement Units</Text>
                <Text style={styles.itemSubtitleOnly}>{selectedMeasurementLabel}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
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
          </View>

          {/* Legal & Support */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>LEGAL & SUPPORT</Text>
          </View>

          <View style={styles.card}>
            {/* Support & FAQ */}
            <TouchableOpacity style={styles.cardItemRowNoBorder} activeOpacity={0.8} onPress={() => router.push('/profile/support')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(98, 250, 227, 0.08)' }]}>
                <Feather name="help-circle" size={16} color={theme.quaternary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Support & FAQ</Text>
                <Text style={styles.itemSubtitleOnly}>Frequently asked questions & help</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* About Us */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => router.push('/profile/about')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(98, 250, 227, 0.08)' }]}>
                <Feather name="info" size={16} color={theme.quaternary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>About Us</Text>
                <Text style={styles.itemSubtitleOnly}>Learn more about Body Axis</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Terms of Service */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => router.push('/profile/terms')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(98, 250, 227, 0.08)' }]}>
                <Feather name="file-text" size={16} color={theme.quaternary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Terms of Service</Text>
                <Text style={styles.itemSubtitleOnly}>Usage agreement & rules</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity style={[styles.cardItemRowNoBorder, styles.rowBorderTop]} activeOpacity={0.8} onPress={() => router.push('/profile/privacy')}>
              <View style={[styles.itemIconBox, { backgroundColor: 'rgba(98, 250, 227, 0.08)' }]}>
                <Feather name="shield" size={16} color={theme.quaternary} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitleOnly}>Privacy Policy</Text>
                <Text style={styles.itemSubtitleOnly}>Your data safety & privacy rules</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 24 }]}>
            {/* Terminate Account */}
            <TouchableOpacity style={styles.cardItemRowNoBorder} activeOpacity={0.8} onPress={handleTerminateAccount}>
              <View style={[styles.itemIconBox, { backgroundColor: theme.warningBG }]}>
                <Feather name="user-x" size={16} color={theme.warning} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitleOnly, { color: theme.warning }]}>
                  {isDeletingAccount ? 'Deleting Account...' : 'Terminate Account'}
                </Text>
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

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditProfileModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsEditProfileVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Animated.View
              style={[
                styles.modalOverlay,
                {
                  opacity: editProfileBackdropOpacity,
                },
              ]}
            >
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setIsEditProfileVisible(false)}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: theme.cardBackground,
                  transform: [{ translateY: editProfileSlideAnim }],
                },
              ]}
            >
              {/* Handle */}
              <View style={styles.sheetHandleContainer}>
                <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
              </View>

              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Update your biometric measurements and personal details
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalFieldsScroll}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>FULL NAME</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="user" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Alexandria Sterling"
                      placeholderTextColor={theme.textSecondary}
                      value={editName}
                      onChangeText={setEditName}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="mail" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="alex@example.com"
                      placeholderTextColor={theme.textSecondary}
                      value={editEmail}
                      onChangeText={setEditEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Gender */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>GENDER</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowEditGenderPicker(true)}
                    style={styles.inputWrapper}
                  >
                    <Feather name="users" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <Text style={[styles.input, !editGender && { color: theme.textSecondary }]}>
                      {genderOptions.find(opt => opt.value === editGender.toLowerCase())?.label || editGender}
                    </Text>
                    <Feather name="chevron-down" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Date of Birth */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>DATE OF BIRTH</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="calendar" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="1994-05-12"
                      placeholderTextColor={theme.textSecondary}
                      value={editDob}
                      onChangeText={setEditDob}
                    />
                  </View>
                </View>

                {/* Height & Weight */}
                <View style={styles.gridRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.modalLabel}>HEIGHT (CM)</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="ruler" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="174"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={editHeight}
                        onChangeText={setEditHeight}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.modalLabel}>WEIGHT (KG)</Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="activity" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="75"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={editWeight}
                        onChangeText={setEditWeight}
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalSubmitButton, { backgroundColor: theme.primary }]}
                  activeOpacity={0.8}
                  onPress={handleSaveProfile}
                  disabled={isUpdatingProfile}
                >
                  <Text style={styles.modalSubmitButtonText}>
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelButton}
                  activeOpacity={0.8}
                  onPress={() => setIsEditProfileVisible(false)}
                >
                  <Text style={[styles.modalCancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          visible={showChangePasswordModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsChangePasswordVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Animated.View
              style={[
                styles.modalOverlay,
                {
                  opacity: changePasswordBackdropOpacity,
                },
              ]}
            >
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setIsChangePasswordVisible(false)}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: theme.cardBackground,
                  transform: [{ translateY: changePasswordSlideAnim }],
                },
              ]}
            >
              {/* Handle */}
              <View style={styles.sheetHandleContainer}>
                <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
              </View>

              <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Choose a strong and secure password for your account
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalFieldsScroll}>
                {/* Current Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>CURRENT PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showCurrentPassword}
                      autoCapitalize="none"
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPassword((prev) => !prev)}
                      style={styles.visibilityToggle}
                    >
                      <Feather
                        name={showCurrentPassword ? 'eye' : 'eye-off'}
                        size={18}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>NEW PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword((prev) => !prev)}
                      style={styles.visibilityToggle}
                    >
                      <Feather
                        name={showNewPassword ? 'eye' : 'eye-off'}
                        size={18}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>CONFIRM NEW PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showConfirmNewPassword}
                      autoCapitalize="none"
                      value={confirmNewPassword}
                      onChangeText={setConfirmNewPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmNewPassword((prev) => !prev)}
                      style={styles.visibilityToggle}
                    >
                      <Feather
                        name={showConfirmNewPassword ? 'eye' : 'eye-off'}
                        size={18}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalSubmitButton, { backgroundColor: theme.primary }]}
                  activeOpacity={0.8}
                  onPress={handleSavePassword}
                  disabled={isChangingPassword}
                >
                  <Text style={styles.modalSubmitButtonText}>
                    {isChangingPassword ? 'Saving...' : 'Save Password'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelButton}
                  activeOpacity={0.8}
                  onPress={() => setIsChangePasswordVisible(false)}
                >
                  <Text style={[styles.modalCancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Gender Selection Sheet inside Edit Profile Modal */}
        <CustomSheet
          visible={showEditGenderPicker}
          onClose={() => setShowEditGenderPicker(false)}
          title="Select Gender"
          options={genderOptions}
          selectedValue={editGender}
          onSelect={(val) => setEditGender(val)}
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
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(5, 11, 20, 0.75)',
    },
    modalSheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      maxHeight: '90%',
    },
    sheetHandleContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    sheetHandle: {
      width: 40,
      height: 5,
      borderRadius: 2.5,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 6,
    },
    modalSubtitle: {
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 18,
      paddingHorizontal: 12,
    },
    modalFieldsScroll: {
      width: '100%',
    },
    inputGroup: {
      width: '100%',
      marginBottom: 16,
    },
    modalLabel: {
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 8,
      letterSpacing: 1.0,
      color: theme.textSecondary,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      height: 52,
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      height: '100%',
      textAlignVertical: 'center',
    },
    gridRow: {
      flexDirection: 'row',
      width: '100%',
    },
    visibilityToggle: {
      padding: 4,
      marginLeft: 8,
    },
    modalSubmitButton: {
      height: 52,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    modalSubmitButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    modalCancelButton: {
      height: 52,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    modalCancelButtonText: {
      fontSize: 15,
      fontWeight: '700',
    },
  });
