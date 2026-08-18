import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Alert, Platform } from 'react-native';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function configureGoogleSignIn() {
  if (webClientId) {
    GoogleSignin.configure({
      webClientId,
      iosClientId: iosClientId || undefined,
      offlineAccess: true,
    });
  } else {
    console.warn(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set in environment variables. Google Sign-In will not be configured.'
    );
  }
}

// Initial configuration
configureGoogleSignIn();

export interface GoogleSignInResult {
  idToken: string;
  email?: string;
  name?: string;
}

export interface AppleSignInResult {
  identityToken: string;
  fullName?: string;
  email?: string;
}

/**
 * Initiates the native Google Sign-In flow.
 * Returns the idToken and user details, or null if cancelled.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult | null> {
  if (!webClientId) {
    Alert.alert(
      'Google Sign-In Error',
      'Google Sign-In is not configured correctly. Please check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.'
    );
    return null;
  }

  try {
    configureGoogleSignIn();

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();

    if (response.type === 'cancelled') {
      return null;
    }

    const { idToken, user } = response.data;

    if (!idToken) {
      throw new Error('No ID token returned from Google Sign-In');
    }

    return {
      idToken,
      email: user?.email,
      name: user?.name || [user?.givenName, user?.familyName].filter(Boolean).join(' '),
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // User cancelled the flow
      return null;
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Google Sign-In is already in progress.');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services are not available or outdated.');
    } else {
      throw new Error(error.message || 'An unknown error occurred during Google Sign-In');
    }
  }
}

/**
 * Initiates the native Apple Sign-In flow.
 * Returns the identityToken and user details, or null if cancelled or unavailable.
 */
export async function signInWithApple(): Promise<AppleSignInResult | null> {
  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    Alert.alert(
      'Apple Sign-In Error',
      'Apple Sign-In is not supported on this device or operating system.'
    );
    return null;
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('No identity token returned from Apple Sign-In');
    }

    let fullName: string | undefined = undefined;
    if (credential.fullName) {
      const { givenName, familyName } = credential.fullName;
      fullName = [givenName, familyName].filter(Boolean).join(' ').trim() || undefined;
    }

    return {
      identityToken: credential.identityToken,
      fullName,
      email: credential.email || undefined,
    };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
      // User cancelled the flow
      return null;
    }
    throw new Error(error.message || 'An unknown error occurred during Apple Sign-In');
  }
}
