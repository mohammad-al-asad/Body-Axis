import React from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/use-theme';
import { AuthHeader } from '@/components/ui/AuthHeader';

import { useVerifyOtpMutation } from '@/redux/api/authApi';
import { getApiErrorMessage } from '@/utils/apiError';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/validation/auth';
import { CustomButton } from '@/components/ui/CustomButton';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ShieldBanIcon } from '@hugeicons/core-free-icons';

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

export default function SetPasswordScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const params = useLocalSearchParams<{ email?: string; purpose?: string; otpCode?: string }>();
  const email = getParam(params.email);
  const otpCode = getParam(params.otpCode);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      purpose: 'forgot_password',
      otpCode,
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    Keyboard.dismiss();

    try {
      const response = await verifyOtp({
        email: values.email.trim(),
        purpose: 'forgot_password',
        otp_code: values.otpCode,
        new_password: values.newPassword,
        confirm_new_password: values.confirmNewPassword,
      }).unwrap();

      Alert.alert('Success', response.message || 'Password reset successfully');
      router.replace('/auth/sign-in');
    } catch (error) {
      Alert.alert('Reset failed', getApiErrorMessage(error));
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader onBackPress={() => router.back()} onHelpPress={() => {}} />

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
                <Text style={styles.cardTitle}>Set New Password</Text>
                <Text style={styles.cardSubtitle}>
                  Choose a strong and secure password for your account
                </Text>

                <View style={styles.passwordFields}>
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
                            secureTextEntry
                            autoCapitalize="none"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                          />
                        )}
                      />
                    </View>
                    {errors.newPassword?.message && (
                      <Text style={styles.errorText}>{errors.newPassword.message}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>CONFIRM PASSWORD</Text>
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
                            secureTextEntry
                            autoCapitalize="none"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                          />
                        )}
                      />
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
                  title="Reset Password"
                  isLoading={isLoading}
                  onPress={handleSubmit(handleResetPassword)}
                />

                {/* Back to Login Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.replace('/auth/sign-in')}
                  style={styles.backToLoginContainer}
                >
                  <Feather name="arrow-left" size={16} color={theme.secondary} style={styles.backIcon} />
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>

              {/* Premium Encryption Footer */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerProtectedText}>
                  PROTECTED BY BODY AXIS ENCRYPTION
                </Text>
                <View style={styles.footerLinksRow}>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.footerLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerBullet}>•</Text>
                  <TouchableOpacity activeOpacity={0.7}>
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
    elevation: 1,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
  errorText: {
    color: theme.error,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 7,
  },
  button: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
