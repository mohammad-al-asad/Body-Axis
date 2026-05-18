import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/use-theme';

import {
  type OtpPurpose,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from '@/redux/api/authApi';
import { getApiErrorMessage } from '@/utils/apiError';
import { otpVerifySchema, type OtpVerifyFormValues } from '@/validation/auth';
import { CustomButton } from '@/components/ui/CustomButton';

const otpLength = 4;
const otpIndexes = Array.from({ length: otpLength }, (_, index) => index);

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

export default function OTPVerifyScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const params = useLocalSearchParams<{ email?: string; purpose?: string }>();
  const email = getParam(params.email);
  const purposeParam = getParam(params.purpose);
  const purpose: OtpPurpose =
    purposeParam === 'email_verify' ? 'email_verify' : 'forgot_password';

  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [timer, setTimer] = useState(59);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [requestOtp, { isLoading: isResending }] = useRequestOtpMutation();

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      email,
      purpose,
      otpCode: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, otpLength - index);
    const newOtp = otpIndexes.map((otpIndex) => otp[otpIndex] ?? '');

    if (cleanText.length > 1) {
      cleanText.split('').forEach((digit, offset) => {
        if (index + offset < otpLength) {
          newOtp[index + offset] = digit;
        }
      });
    } else {
      newOtp[index] = cleanText;
    }

    setOtp(newOtp);
    setValue('otpCode', newOtp.join(''), {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (cleanText.length > 0) {
      const nextIndex = Math.min(index + cleanText.length, otpLength - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Backspace to return to previous input cell
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const clearOtp = () => {
    const emptyOtp = Array(otpLength).fill('');
    setOtp(emptyOtp);
    setValue('otpCode', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    inputRefs.current[0]?.focus();
  };

  const handleResend = async () => {
    if (!email || timer > 0) {
      return;
    }

    try {
      const response = await requestOtp({ email, purpose }).unwrap();
      if (response.dev_otp) {
        Alert.alert('Development OTP', response.dev_otp);
      }
      clearOtp();
      setTimer(59);
    } catch (error) {
      Alert.alert('Resend failed', getApiErrorMessage(error));
    }
  };

  const handleVerify = async (values: OtpVerifyFormValues) => {
    Keyboard.dismiss();

    if (values.purpose === 'forgot_password') {
      if (values.otpCode.length < 4) {
        Alert.alert('Validation Error', 'Enter the 4-digit code');
        return;
      }
      router.push({
        pathname: '/(auth)/set-password',
        params: {
          email: values.email,
          purpose: values.purpose,
          otpCode: values.otpCode,
        },
      });
      return;
    }

    try {
      const response = await verifyOtp({
        email: values.email.trim(),
        purpose: values.purpose,
        otp_code: values.otpCode,
      }).unwrap();

      Alert.alert('Success', response.message);
      router.replace('/(intake)');
    } catch (error) {
      Alert.alert('Verification failed', getApiErrorMessage(error));
    }
  };

  const formatTimer = () => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Custom Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={require('@/assets/images/app/Body Axis™.png')}
              style={styles.headerLogo}
              contentFit="contain"
            />

            <TouchableOpacity activeOpacity={0.7} style={styles.headerButton}>
              <Feather name="help-circle" size={22} color="#5C6E84" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Logo/Icon above the card */}
            <Image
              source={require('@/assets/images/forgotIcon.png')}
              style={styles.forgotIcon}
              contentFit="contain"
            />

            {/* Main Center Card Container */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Verification Code</Text>
              <Text style={styles.cardSubtitle}>
                We have sent a 4-digit code to {email || 'your email'}
              </Text>

              {/* 4-Digit OTP Grid */}
              <View style={styles.otpGrid}>
                {otpIndexes.map((index) => (
                  <View key={index} style={styles.otpInputWrapper}>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[index] ?? ''}
                      onChangeText={(text) => handleChangeText(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      placeholderTextColor="#3A4D62"
                      placeholder="-"
                      textAlign="center"
                    />
                  </View>
                ))}
              </View>
              {errors.otpCode?.message && (
                <Text style={styles.errorText}>{errors.otpCode.message}</Text>
              )}

              {/* Timer & Resend Option */}
              <View style={styles.timerContainer}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>Resend code in {formatTimer()}</Text>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={isResending}
                    onPress={handleResend}
                  >
                    <Text style={styles.resendLinkText}>
                      {isResending ? 'Sending...' : 'Resend OTP Code'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Action Button */}
              <CustomButton
                title="Verify & Proceed"
                isLoading={isLoading}
                onPress={handleSubmit(handleVerify)}
              />

              {/* Back to Login Link */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.replace('/(auth)/sign-in')}
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
          </KeyboardAvoidingView>
        </SafeAreaView>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  otpInputWrapper: {
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
    width: '100%',
    height: '100%',
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
    alignSelf: 'flex-start',
    color: theme.error,
    fontSize: 12,
    fontWeight: '600',
    marginTop: -14,
    marginBottom: 14,
  },
  timerContainer: {
    marginBottom: 32,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  resendLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.secondary,
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
