import React, { useState, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import Svg, { Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { useTheme, useThemeState } from '@/hooks/use-theme';
import { completeOnboarding } from '@/redux/slice/settings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ListCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  theme: any;
  themeState: string;
}

function ListCard({ icon, title, subtitle, theme, themeState }: ListCardProps) {
  const cardStyles = styles(theme, themeState);
  return (
    <View style={cardStyles.listCard}>
      <View style={cardStyles.iconCircle}>
        <Feather name={icon} size={18} color={theme.secondary} />
      </View>
      <View style={cardStyles.cardTextContent}>
        <Text style={cardStyles.cardTitle}>{title}</Text>
        <Text style={cardStyles.cardSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

interface GradientHeadingProps {
  text1: string;
  text2?: string;
  theme: any;
}

function GradientHeading({ text1, text2 }: GradientHeadingProps) {
  const height = text2 ? 72 : 44;
  return (
    <View style={{ width: '100%', height, alignItems: 'center', marginBottom: 12 }}>
      <Svg height={height} width="100%">
        <Defs>
          <SvgLinearGradient id="headingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#5DE6FF" />
          </SvgLinearGradient>
        </Defs>
        <SvgText
          fill="url(#headingGrad)"
          fontSize="24"
          fontFamily={Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed'}
          fontWeight="800"
          textAnchor="middle"
          x="50%"
          y={text2 ? 26 : 32}
        >
          {text1}
        </SvgText>
        {text2 && (
          <SvgText
            fill="url(#headingGrad)"
            fontSize="24"
            fontFamily={Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed'}
            fontWeight="800"
            textAnchor="middle"
            x="50%"
            y="58"
          >
            {text2}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

interface OnboardingSlide {
  id: number;
  image: any;
  title1: string;
  title2?: string;
  description: string;
  items?: {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    subtitle: string;
  }[];
}

const slidesData: OnboardingSlide[] = [
  {
    id: 0,
    image: require('@/assets/images/onboarding/1.png'),
    title1: 'Move Better With a Plan',
    title2: 'Built for you',
    description: 'Move better. Feel stronger. Personalized movement plans built around your body.',
    items: [
      { icon: 'activity', title: 'Tailored Corrective Routines', subtitle: 'Specifically designed for your body alignment' },
      { icon: 'trending-up', title: 'Track Your Progress', subtitle: 'See improvements and feel the difference' },
    ],
  },
  {
    id: 1,
    image: require('@/assets/images/onboarding/2.png'),
    title1: 'Move Better With a Plan',
    title2: 'Built for you',
    description: 'No two bodies are the same. Your movement plan is built around yours.',
    items: [
      { icon: 'crosshair', title: 'Pick a Focus Area', subtitle: 'Choose what matters most to you' },
      { icon: 'heart', title: 'Tell us How It Feels', subtitle: 'Share how your body feels today' },
    ],
  },
  {
    id: 2,
    image: require('@/assets/images/onboarding/3.png'),
    title1: 'Simple Guided Sessions',
    description: 'Follow your movement plan with easy-to-use sessions, clear exercise guidance, and simple progress tracking.',
    items: [
      { icon: 'clock', title: '15, 30, or 45 Minute Plans', subtitle: 'Choose the session length that fits your day' },
      { icon: 'video', title: 'Exercise View', subtitle: 'Watch the full tutorial, then follow the movement clip while you train' },
    ],
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const themeState = useThemeState();
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    if (activeIndex < 2) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      dispatch(completeOnboarding());
      router.replace('/auth/sign-in');
    }
  };

  const handleSkip = () => {
    dispatch(completeOnboarding());
    router.replace('/auth/sign-in');
  };

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index <= 2) {
      setActiveIndex(index);
    }
  };

  const compStyles = styles(theme, themeState);

  return (
    <View style={compStyles.container}>
      <SafeAreaView style={compStyles.safeArea} edges={['top', 'bottom']}>
        {/* Top Header Row */}
        <View style={compStyles.headerRow}>
          <Text style={compStyles.stepText}>STEP 0{activeIndex + 1} / 03</Text>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={compStyles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Paging Slides list */}
        <FlatList
          ref={flatListRef}
          data={slidesData}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={compStyles.slide}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={compStyles.scrollContent}
              >
                {/* Onboarding Image Illustration */}
                <View style={compStyles.imageContainer}>
                  <Image
                    source={item.image}
                    style={compStyles.illustrationImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Title Header */}
                <View style={compStyles.titleWrapper}>
                  <GradientHeading
                    text1={item.title1}
                    text2={item.title2}
                    theme={theme}
                  />
                  <Text style={compStyles.descriptionText}>
                    {item.description}
                  </Text>
                </View>

                {/* Cards List */}
                {item.items && (
                  <View style={compStyles.listContainer}>
                    {item.items.map((subItem, idx) => (
                      <ListCard
                        key={idx}
                        icon={subItem.icon}
                        title={subItem.title}
                        subtitle={subItem.subtitle}
                        theme={theme}
                        themeState={themeState}
                      />
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        />

        {/* Bottom Section with Indicator and CTA */}
        <View style={compStyles.bottomContainer}>
          {/* Page Indicators */}
          <View style={compStyles.indicatorRow}>
            <View
              style={[
                compStyles.indicatorDot,
                activeIndex === 0 ? compStyles.indicatorActive : compStyles.indicatorInactive,
              ]}
            />
            <View
              style={[
                compStyles.indicatorDot,
                activeIndex === 1 ? compStyles.indicatorActive : compStyles.indicatorInactive,
              ]}
            />
            <View
              style={[
                compStyles.indicatorDot,
                activeIndex === 2 ? compStyles.indicatorActive : compStyles.indicatorInactive,
              ]}
            />
          </View>

          {/* Next / Get Started Button */}
          <TouchableOpacity
            style={compStyles.actionButton}
            activeOpacity={0.8}
            onPress={handleNext}
          >
            <Text style={compStyles.actionButtonText}>
              {activeIndex === 2 ? 'Get Started' : 'Next'}
            </Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    stepText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 1.5,
    },
    skipText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.secondary,
    },
    slide: {
      width: SCREEN_WIDTH,
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
      paddingHorizontal: 24,
    },
    imageContainer: {
      width: '100%',
      height: 280,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 16,
    },
    illustrationImage: {
      width: '90%',
      height: '100%',
    },
    titleWrapper: {
      alignItems: 'center',
    },
    descriptionText: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 24,
      paddingHorizontal: 12,
    },
    listContainer: {
      width: '100%',
      gap: 12,
      marginBottom: 16,
    },
    listCard: {
      backgroundColor: themeState === 'dark' ? '#111827' : theme.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: themeState === 'dark' ? '#1E2B40' : theme.inputBorder,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(93, 230, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    cardTextContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    cardSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    bottomContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      gap: 16,
    },
    indicatorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    indicatorDot: {
      height: 6,
      borderRadius: 3,
    },
    indicatorActive: {
      width: 24,
      backgroundColor: theme.secondary,
    },
    indicatorInactive: {
      width: 6,
      backgroundColor: themeState === 'dark' ? '#1E2B40' : '#D0D1D6',
    },
    actionButton: {
      width: '100%',
      height: 54,
      borderRadius: 14,
      backgroundColor: theme.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  });
