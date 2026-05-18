import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { completeOnboarding } from '@/redux/slice/settings';
import { useTheme } from '@/hooks/use-theme';
import { CustomButton } from '@/components/ui/CustomButton';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SlideItem {
  id: string;
  textBefore: string;
  highlightText: string;
  textAfter: string;
  description: string;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    textBefore: 'Move Without ',
    highlightText: 'Pain',
    textAfter: '',
    description: 'Discover structured mobility and corrective exercise programs designed to improve movement, reduce stiffness, and help your body feel better every day.',
  },
  {
    id: '2',
    textBefore: 'Restore Your ',
    highlightText: 'Alignment',
    textAfter: '',
    description: 'Optimize your posture and joint mechanics. Balance your body\'s axis to prevent injuries and move with effortless grace and power.',
  },
  {
    id: '3',
    textBefore: 'Unlock Elite ',
    highlightText: 'Mobility',
    textAfter: '',
    description: 'Gain full range of motion and flexibility. Track your daily physical progression and build a body that feels truly limitless.',
  },
];

export default function OnboardingScreen() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index >= 0 && index < SLIDES.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    } else {
      dispatch(completeOnboarding());
      router.replace('/(auth)/sign-in');
    }
  };

  const renderItem = ({ item }: { item: SlideItem }) => {
    return (
      <View style={styles.slide}>
        {/* Glow-bordered Illustration Frame */}
        <View style={styles.imageFrame}>
          <Image
            source={require('@/assets/images/onboarding/1.png')}
            style={styles.image}
            contentFit="cover"
          />
        </View>

        {/* Content Typography */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {item.textBefore}
            <Text style={styles.highlightText}>{item.highlightText}</Text>
            {item.textAfter}
          </Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Swipable FlatList */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={getItemLayout}
          style={styles.flatList}
        />

        {/* Fixed Footer Pagination and Actions */}
        <View style={styles.footer}>
          {/* Page Indicators */}
          <View style={styles.indicatorContainer}>
            {SLIDES.map((_, i) => {
              const isActive = i === activeIndex;
              return (
                <View
                  key={i}
                  style={[
                    styles.indicator,
                    isActive ? styles.activeIndicator : styles.inactiveIndicator,
                  ]}
                />
              );
            })}
          </View>

          {/* Action Button */}
          <CustomButton
            title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
          />
        </View>
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
    justifyContent: 'space-between',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  imageFrame: {
    width: SCREEN_WIDTH - 48,
    aspectRatio: 1,
    borderRadius: 28,
    backgroundColor: theme.cardBackground,
    borderWidth: 1.5,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginTop: 36,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  highlightText: {
    color: theme.secondary,
  },
  description: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '400',
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: theme.primary,
  },
  inactiveIndicator: {
    width: 6,
    backgroundColor: theme.inputBorder,
  },
  button: {
    width: SCREEN_WIDTH - 48,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
