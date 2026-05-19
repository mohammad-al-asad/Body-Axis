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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useTheme } from '@/hooks/use-theme';

import { useLoginMutation, useRequestOtpMutation } from '@/redux/api/authApi';
import { setCredentials } from '@/redux/slice/auth';
import { getApiErrorMessage } from '@/utils/apiError';
import { loginSchema, type LoginFormValues } from '@/validation/auth';
import { CustomButton } from '@/components/ui/CustomButton';

export default function SignInScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    Keyboard.dismiss();

    try {
      const response = await login({
        email: values.email.trim(),
        password: values.password,
      }).unwrap();

      dispatch(
        setCredentials({
          accessToken: response.access_token,
          tokenType: response.token_type,
          user: response.user,
        })
      );

      if (!response.user.email_verified) {
        const otpResponse = await requestOtp({
          email: response.user.email,
          purpose: 'email_verify',
        }).unwrap();

        if (otpResponse.dev_otp) {
          Alert.alert('Development OTP', otpResponse.dev_otp);
        }

        router.replace({
          pathname: '/(auth)/otp-verify',
          params: {
            email: response.user.email,
            purpose: 'email_verify',
          },
        });
        return;
      }

      router.replace('/(auth)/premium');
    } catch (error) {
      Alert.alert('Sign in failed', getApiErrorMessage(error));
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Centered branding header */}
              <View style={styles.header}>
                <Image
                  source={require('@/assets/images/app/illustrationWithText.png')}
                  style={styles.logoText}
                  contentFit="contain"
                />
                
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Continue your mobility journey</Text>
              </View>

              {/* Input Card Container */}
              <View style={styles.card}>
                {/* Email input field */}
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

                {/* Password input field */}
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
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                      style={styles.eyeButton}>
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password?.message && (
                    <Text style={styles.errorText}>{errors.password.message}</Text>
                  )}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.forgotContainer}
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Action Submit Button */}
                <CustomButton
                  title="Sign In"
                  isLoading={isLoading || isRequestingOtp}
                  onPress={handleSubmit(onSubmit)}
                />

                {/* Third-party Sign In options */}
                <View style={styles.separatorContainer}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>OR CONTINUE WITH</Text>
                  <View style={styles.separatorLine} />
                </View>

                {/* Social Row buttons */}
                <View style={styles.socialRow}>
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                    <Image source={require('@/assets/images/icons/google.png')} style={styles.socialIconImage} contentFit="contain" />
                    <Text style={styles.socialText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                    <Image source={require('@/assets/images/icons/apple.png')} style={[styles.socialIconImage, { tintColor: theme.text }]} contentFit="contain" />
                    <Text style={styles.socialText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom transition footer */}
              <View style={styles.bottomSwitch}>
                <Text style={styles.bottomText}>
                  Do not have an account?{' '}
                  <Text style={styles.switchLink} onPress={() => router.replace('/(auth)/sign-up')}>
                    Sign Up
                  </Text>
                </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
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
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 6,
  },
  card: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    elevation: 1,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
  eyeButton: {
    padding: 6,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: theme.secondary,
    fontSize: 13,
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
});
