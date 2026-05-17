import { Image } from 'expo-image';
import React, { useState } from 'react';
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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useTheme } from '@/hooks/use-theme';

import { type Gender, useSignupMutation } from '@/redux/api/authApi';
import { setCredentials } from '@/redux/slice/auth';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  dateOfBirthToApiDate,
  signupSchema,
  type SignupFormValues,
} from '@/validation/auth';
import { CustomButton } from '@/components/ui/CustomButton';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Female02Icon, Male02Icon, ShieldBanIcon } from '@hugeicons/core-free-icons';

const genderOptions: { label: string; value: Gender }[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
];

export default function SignUpScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'female',
      dateOfBirth: '',
      agree: false,
    },
  });

  const gender = watch('gender');
  const agree = watch('agree');
  const selectedGender = genderOptions.find((option) => option.value === gender);

  const onSubmit = async (values: SignupFormValues) => {
    Keyboard.dismiss();

    const dateOfBirth = dateOfBirthToApiDate(values.dateOfBirth);
    if (!dateOfBirth) {
      return;
    }

    try {
      const response = await signup({
        full_name: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        confirm_password: values.confirmPassword,
        gender: values.gender,
        date_of_birth: dateOfBirth,
      }).unwrap();

      dispatch(
        setCredentials({
          accessToken: response.access_token,
          tokenType: response.token_type,
          user: response.user,
        })
      );

      if (response.dev_otp) {
        Alert.alert('Development OTP', response.dev_otp);
      }

      router.push({
        pathname: '/(auth)/otp-verify',
        params: {
          email: values.email.trim(),
          purpose: 'email_verify',
        },
      });
    } catch (error) {
      Alert.alert('Signup failed', getApiErrorMessage(error));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}>
            
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              
              {/* Header branding */}
              <View style={styles.header}>
                <Image
                  source={require('@/assets/images/app/illustrationWithText.png')}
                  style={styles.logoText}
                  contentFit="contain"
                />
                
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>Start moving pain-free with Body Axis™.</Text>
              </View>

              {/* Scrollable Form Card */}
              <View style={styles.card}>
                
                {/* Full Name input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>FULL NAME</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="user" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <Controller
                      control={control}
                      name="fullName"
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="John Doe"
                          placeholderTextColor={theme.textSecondary}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.fullName?.message && (
                    <Text style={styles.errorText}>{errors.fullName.message}</Text>
                  )}
                </View>

                {/* Email input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="mail" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="name@example.com"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.email?.message && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </View>

                {/* Password input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor={theme.textSecondary}
                          secureTextEntry
                          autoCapitalize="none"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.password?.message && (
                    <Text style={styles.errorText}>{errors.password.message}</Text>
                  )}
                </View>

                {/* Confirm Password input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONFIRM PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <HugeiconsIcon icon={ShieldBanIcon} size={18} color={theme.textSecondary} />
                    </View>
                    <Controller
                      control={control}
                      name="confirmPassword"
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor={theme.textSecondary}
                          secureTextEntry
                          autoCapitalize="none"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.confirmPassword?.message && (
                    <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                  )}
                </View>

                {/* Gender selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>GENDER</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    activeOpacity={0.8}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowGenderPicker(true);
                    }}>
                    <View style={styles.inputIcon}>
                      {gender === 'male' ? (
                        <HugeiconsIcon icon={Male02Icon} size={18} color={theme.textSecondary} />
                      ) : gender === 'female' ? (
                        <HugeiconsIcon icon={Female02Icon} size={18} color={theme.textSecondary} />
                      ) : (
                        <Feather name="users" size={18} color={theme.textSecondary} />
                      )}
                    </View>
                    <Text style={styles.selectorText}>{selectedGender?.label ?? 'Select gender'}</Text>
                    <Feather name="chevron-down" size={18} color={theme.textSecondary} style={styles.chevronIcon} />
                  </TouchableOpacity>
                  {errors.gender?.message && (
                    <Text style={styles.errorText}>{errors.gender.message}</Text>
                  )}
                </View>

                {/* Date of Birth input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>DATE OF BIRTH</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="calendar" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                    <Controller
                      control={control}
                      name="dateOfBirth"
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="MM/DD/YYYY"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numbers-and-punctuation"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.dateOfBirth?.message && (
                    <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
                  )}
                </View>

                {/* Terms Agreement Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  activeOpacity={0.8}
                  onPress={() =>
                    setValue('agree', !agree, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }>
                  <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                    {agree && <Feather name="check" size={14} color={theme.text} />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the <Text style={styles.cyanLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.cyanLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
                {errors.agree?.message && (
                  <Text style={[styles.errorText, styles.checkboxError]}>
                    {errors.agree.message}
                  </Text>
                )}

                {/* Create Account Action Button */}
                <CustomButton
                  title="Create account"
                  isLoading={isLoading}
                  onPress={handleSubmit(onSubmit)}
                />

                {/* Social register separator */}
                <View style={styles.separatorContainer}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>OR SIGN UP WITH</Text>
                  <View style={styles.separatorLine} />
                </View>

                {/* Social register row */}
                <View style={styles.socialRow}>
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                    <Image source={require('@/assets/images/icons/google.png')} style={styles.socialIconImage} contentFit="contain" />
                    <Text style={styles.socialText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                    <Image source={require('@/assets/images/icons/apple.png')} style={styles.socialIconImage} contentFit="contain" />
                    <Text style={styles.socialText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom switching footer */}
              <View style={styles.bottomSwitch}>
                <Text style={styles.bottomText}>
                  Already have an account?{' '}
                  <Text style={styles.switchLink} onPress={() => router.replace('/(auth)/sign-in')}>
                    Sign In
                  </Text>
                </Text>
              </View>

            </ScrollView>

          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Gender Picker Bottom Sheet Modal */}
        {showGenderPicker && (
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowGenderPicker(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    gender === option.value && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    setValue('gender', option.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setShowGenderPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      gender === option.value && styles.modalOptionTextActive,
                    ]}>
                    {option.label}
                  </Text>
                  {gender === option.value && (
                    <Feather name="check" size={18} color={theme.secondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    width: 240,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 56,
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
    height: '100%',
  },
  errorText: {
    color: theme.error,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 7,
  },
  selectorText: {
    color: theme.text,
    fontSize: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingRight: 12,
  },
  checkboxError: {
    marginTop: 0,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: theme.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: theme.inputBackground,
  },
  checkboxActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkboxLabel: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  cyanLink: {
    color: theme.secondary,
    fontWeight: '600',
  },
  button: {
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.inputBorder,
  },
  separatorText: {
    color: theme.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconImage: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSwitch: {
    alignItems: 'center',
    marginTop: 24,
  },
  bottomText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  switchLink: {
    color: theme.secondary,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 11, 20, 0.75)',
    justifyContent: 'flex-end',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: theme.inputBorder,
  },
  modalOptionActive: {
    borderColor: theme.secondary,
  },
  modalOptionText: {
    color: theme.textSecondary,
    fontSize: 16,
  },
  modalOptionTextActive: {
    color: theme.secondary,
    fontWeight: '600',
  },
});
