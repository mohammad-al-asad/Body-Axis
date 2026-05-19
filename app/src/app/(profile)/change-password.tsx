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
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@/hooks/use-theme';
import { CustomButton } from '@/components/ui/CustomButton';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ShieldBanIcon } from '@hugeicons/core-free-icons';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Your password has been changed successfully.');
      reset();
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
          {/* Custom Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Feather name="arrow-left" size={22} color={theme.text} />
            </TouchableOpacity>

            <Image
              source={require('@/assets/images/app/Body Axis™.png')}
              style={styles.headerLogo}
              contentFit="contain"
            />

            <TouchableOpacity activeOpacity={0.7} style={styles.headerButton}>
              <Feather name="help-circle" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

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
              {/* Logo/Icon above the card */}
              <Image
                source={require('@/assets/images/forgotIcon.png')}
                style={styles.forgotIcon}
                contentFit="contain"
              />

              {/* Main Center Card Container */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Change Password</Text>
                <Text style={styles.cardSubtitle}>
                  Choose a strong and secure password for your account
                </Text>

                <View style={styles.passwordFields}>
                  {/* Current Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>CURRENT PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="lock" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                      <Controller
                        control={control}
                        name="currentPassword"
                        render={({ field: { onBlur, onChange, value } }) => (
                          <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={theme.textSecondary}
                            secureTextEntry={!showCurrentPassword}
                            autoCapitalize="none"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                          />
                        )}
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
                    {errors.currentPassword?.message && (
                      <Text style={styles.errorText}>{errors.currentPassword.message}</Text>
                    )}
                  </View>

                  {/* New Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>NEW PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="lock" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                      <Controller
                        control={control}
                        name="newPassword"
                        render={({ field: { onBlur, onChange, value } }) => (
                          <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={theme.textSecondary}
                            secureTextEntry={!showNewPassword}
                            autoCapitalize="none"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                          />
                        )}
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
                    {errors.newPassword?.message && (
                      <Text style={styles.errorText}>{errors.newPassword.message}</Text>
                    )}
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <HugeiconsIcon icon={ShieldBanIcon} size={18} color={theme.textSecondary} />
                      </View>
                      <Controller
                        control={control}
                        name="confirmNewPassword"
                        render={({ field: { onBlur, onChange, value } }) => (
                          <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={theme.textSecondary}
                            secureTextEntry={!showConfirmNewPassword}
                            autoCapitalize="none"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                          />
                        )}
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
                    {errors.confirmNewPassword?.message && (
                      <Text style={styles.errorText}>
                        {errors.confirmNewPassword.message}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Submit Action Button */}
                <CustomButton
                  title="Save Password"
                  isLoading={isSubmitting}
                  onPress={handleSubmit(onSubmit)}
                />

                {/* Back to Profile Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.back()}
                  style={styles.backToLoginContainer}
                >
                  <Feather name="arrow-left" size={16} color={theme.secondary} style={styles.backIcon} />
                  <Text style={styles.backToLoginText}>Back to Profile</Text>
                </TouchableOpacity>
              </View>

              {/* Premium Encryption Footer */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerProtectedText}>
                  PROTECTED BY BODY AXIS ENCRYPTION
                </Text>
                <View style={styles.footerLinksRow}>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(profile)/privacy')}>
                    <Text style={styles.footerLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerBullet}>•</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(profile)/support')}>
                    <Text style={styles.footerLink}>Support</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  headerButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: 110,
    height: 22,
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
  forgotIcon: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: 'center',
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
  passwordFields: {
    width: '100%',
    marginBottom: 8,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 18,
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
  },
  visibilityToggle: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: theme.error,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 7,
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
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  footerBullet: {
    fontSize: 12,
    color: theme.textSecondary,
    marginHorizontal: 8,
  },
});
