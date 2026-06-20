import React, { useState, useEffect } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/use-theme';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomSheet } from '@/components/ui/CustomSheet';
import { AuthHeader } from '@/components/ui/AuthHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Female02Icon, Male02Icon } from '@hugeicons/core-free-icons';

const genderOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
];

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('Female');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing profile from AsyncStorage
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const stored = await AsyncStorage.getItem('@user_profile');
        if (stored) {
          const data = JSON.parse(stored);
          setName(data.name || 'Alexandria Sterling');
          setGender(data.gender || 'Female');
          setDob(data.dob || '12 May 1994');
          setHeight(data.height ? data.height.toString() : '174');
          setWeight(data.weight ? data.weight.toString() : '75');
        } else {
          // Defaults if nothing stored
          setName('Alexandria Sterling');
          setGender('Female');
          setDob('12 May 1994');
          setHeight('174');
          setWeight('75');
        }
      } catch {
        console.log('Failed to load profile data');
      }
    };
    loadProfileData();
  }, []);

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return;
    }
    if (!dob.trim()) {
      Alert.alert('Validation Error', 'Date of Birth is required.');
      return;
    }

    const heightNum = parseInt(height, 10);
    if (isNaN(heightNum) || heightNum <= 50 || heightNum >= 300) {
      Alert.alert('Validation Error', 'Please enter a valid height between 50 and 300 cm.');
      return;
    }

    const weightNum = parseInt(weight, 10);
    if (isNaN(weightNum) || weightNum <= 10 || weightNum >= 500) {
      Alert.alert('Validation Error', 'Please enter a valid weight between 10 and 500 kg.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProfile = {
        name: name.trim(),
        gender,
        dob: dob.trim(),
        height: heightNum,
        weight: weightNum,
      };
      await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedProfile));
      Alert.alert('Success', 'Profile updated successfully.');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          onBackPress={() => router.back()}
          onHelpPress={() => {}}
          showShadow={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Main Center Card Container */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Edit Profile</Text>
              <Text style={styles.cardSubtitle}>
                Update your biometric measurements and personal details
              </Text>

              <View style={styles.fieldsContainer}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>FULL NAME</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="user" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Alexandria Sterling"
                      placeholderTextColor={theme.textSecondary}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                {/* Gender (Custom Dropdown Selector) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>GENDER</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowGenderPicker(true)}
                    style={styles.inputWrapper}
                  >
                    <View style={styles.inputIcon}>
                      {gender.toLowerCase() === 'male' ? (
                        <HugeiconsIcon icon={Male02Icon} size={18} color={theme.textSecondary} />
                      ) : gender.toLowerCase() === 'female' ? (
                        <HugeiconsIcon icon={Female02Icon} size={18} color={theme.textSecondary} />
                      ) : (
                        <Feather name="users" size={18} color={theme.textSecondary} />
                      )}
                    </View>
                    <Text style={[styles.input, !gender && { color: theme.textSecondary }]}>
                      {genderOptions.find(opt => opt.value === gender.toLowerCase())?.label || gender}
                    </Text>
                    <Feather name="chevron-down" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Date of Birth */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>DATE OF BIRTH</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="calendar" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="12 May 1994"
                      placeholderTextColor={theme.textSecondary}
                      value={dob}
                      onChangeText={setDob}
                    />
                  </View>
                </View>

                {/* Height & Weight Grid */}
                <View style={styles.gridRow}>
                  {/* Height */}
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>HEIGHT (CM)</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="ruler" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="174"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={height}
                        onChangeText={setHeight}
                      />
                    </View>
                  </View>

                  {/* Weight */}
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.label}>WEIGHT (KG)</Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="activity" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="75"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={setWeight}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Submit Action Button */}
              <CustomButton
                title="Save Changes"
                isLoading={isSubmitting}
                onPress={handleSave}
              />

              {/* Back to Profile Link */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                style={styles.backToLoginContainer}
              >
                <Feather name="arrow-left" size={16} color={theme.secondary} style={styles.backIcon} />
                <Text style={styles.backToLoginText}>Cancel & Go Back</Text>
              </TouchableOpacity>
            </View>

            {/* Premium Encryption Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerProtectedText}>
                PROTECTED BY BODY AXIS ENCRYPTION
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <CustomSheet
        visible={showGenderPicker}
        onClose={() => setShowGenderPicker(false)}
        title="Select Gender"
        options={genderOptions}
        selectedValue={gender}
        onSelect={(val) => setGender(val)}
      />
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

    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      width: '100%',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      width: '100%',
      paddingHorizontal: 24,
      paddingVertical: 32,
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    cardSubtitle: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.textSecondary,
      marginBottom: 32,
      textAlign: 'center',
      lineHeight: 20,
    },
    fieldsContainer: {
      width: '100%',
      marginBottom: 16,
    },
    inputGroup: {
      width: '100%',
      marginBottom: 18,
    },
    gridRow: {
      flexDirection: 'row',
      width: '100%',
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      marginBottom: 8,
      letterSpacing: 1.2,
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
      lineHeight: 20,
    },
    backToLoginContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      marginTop: 18,
    },
    backIcon: {
      marginRight: 6,
    },
    backToLoginText: {
      color: theme.secondary,
      fontSize: 14,
      fontWeight: '600',
    },
    footerContainer: {
      marginTop: 40,
      alignItems: 'center',
      width: '100%',
    },
    footerProtectedText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 1.5,
      marginBottom: 8,
    },
  });
