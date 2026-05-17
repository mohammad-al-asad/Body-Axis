import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    // Show splash for 2.2 seconds, then smoothly fade out
    const timer = setTimeout(() => {
      overlayOpacity.value = withTiming(
        0,
        { duration: 700, easing: Easing.inOut(Easing.ease) },
        (finished) => {
          if (finished) {
            runOnJS(setVisible)(false);
          }
        }
      );
    }, 2200);

    return () => clearTimeout(timer);
  }, [overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlayContainer, overlayStyle]}>
      {/* Premium starry background image */}
      <Image
        source={require('@/assets/images/app/bgSplash.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      {/* Combined Branding Logo & Title Asset */}
      <View style={styles.splashContent}>
        <Image
          source={require('@/assets/images/app/illustrationWithText.png')}
          style={styles.splashLogo}
          contentFit="contain"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050B14',
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  splashLogo: {
    width: 240,
    height: 120,
  },
});
