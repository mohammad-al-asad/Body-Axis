import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useDispatch } from 'react-redux';

import { useTheme, useThemeState } from '@/hooks/use-theme';
import { AuthHeader } from '@/components/ui/AuthHeader';
import { completeIntroduction } from '@/redux/slice/settings';
import { DEMO_VIDEO_THUMBNAIL_URL, ISLAMIC_DEMO_VIDEO_URL } from '@/constants/videos';
import { useGetIntroductionContentQuery } from '@/redux/api/contentApi';

const DEFAULT_MESSAGE_TITLE = 'Precision in every movement.';
const DEFAULT_MESSAGE_QUOTE =
  '“I built Body Axis™ to bridge the gap between hard work and scientific mobility. We don’t just track reps; we track how your joints interact with the world.”';

export default function IntroductionScreen() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);
  const dispatch = useDispatch();
  const { data: introductionContent } = useGetIntroductionContentQuery();
  const videoUrl = introductionContent?.video_url || ISLAMIC_DEMO_VIDEO_URL;
  const thumbnailUrl = introductionContent?.thumbnail_url || DEMO_VIDEO_THUMBNAIL_URL;
  const messageTitle = introductionContent?.message_title || DEFAULT_MESSAGE_TITLE;
  const messageQuote = introductionContent?.message_quote || DEFAULT_MESSAGE_QUOTE;

  const handleHelp = () => {
    Alert.alert(
      'Introduction Info',
      'This short overview introduces Body Axis™ and how it helps you build personalized movement sessions based on your body, goals, and progress.',
    );
  };

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoPlayer = useVideoPlayer(null);

  useEffect(() => {
    setIsVideoPlaying(false);
    setIsVideoLoading(true);
    void videoPlayer
      .replaceAsync(videoUrl)
      .catch((error) => {
        console.error('Failed to load introduction video', error);
      })
      .finally(() => {
        setIsVideoLoading(false);
      });
  }, [videoPlayer, videoUrl]);

  useEventListener(videoPlayer, 'statusChange', ({ status }) => {
    setIsVideoLoading(status === 'loading');
  });

  useEventListener(videoPlayer, 'playingChange', ({ isPlaying }) => {
    if (isPlaying) {
      setIsVideoLoading(false);
    }
  });

  useEventListener(videoPlayer, 'playToEnd', () => {
    videoPlayer.pause();
    setIsVideoPlaying(false);
    setIsVideoLoading(false);
  });

  const handleWatchIntroduction = async () => {
    try {
      setIsVideoLoading(true);
      setIsVideoPlaying(true);
      videoPlayer.currentTime = 0;
      videoPlayer.play();
    } catch (error) {
      setIsVideoLoading(false);
      setIsVideoPlaying(false);
      console.error('Failed to play introduction video', error);
      Alert.alert('Video Unavailable', 'Unable to play the introduction video right now.');
    }
  };

  const handleSkip = () => {
    videoPlayer.pause();
    dispatch(completeIntroduction());
  };

  const handleBack = () => {
    videoPlayer.pause();
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AuthHeader onHelpPress={handleHelp} onBackPress={handleBack} showShadow />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Welcome Title & Subtitle */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Body Axis™</Text>
            <Text style={styles.welcomeSubtitle}>
              Your transformation starts with understanding how your body moves. Let’s begin.
            </Text>
          </View>

          {/* Inline Video Preview */}
          <View style={styles.videoCard}>
            {isVideoPlaying ? (
              <>
                <VideoView
                  player={videoPlayer}
                  contentFit="cover"
                  nativeControls={false}
                  style={styles.inlineVideo}
                />
                {isVideoLoading && (
                  <View style={styles.videoLoadingOverlay}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                )}
              </>
            ) : (
              <TouchableOpacity
                style={styles.videoThumbnailButton}
                activeOpacity={0.9}
                onPress={() => {
                  void handleWatchIntroduction();
                }}
              >
                <Image
                  source={{
                    uri: thumbnailUrl,
                  }}
                  style={styles.videoThumbnail}
                />
                <View style={styles.playButtonWrapper}>
                  {isVideoLoading ? (
                    <View style={styles.playButtonInner}>
                      <ActivityIndicator color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.playButtonInner}>
                      <Feather name="play" size={22} color="#FFFFFF" style={{ marginLeft: 3 }} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Message Card from Christina */}
          <View style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={styles.messageDot} />
              <Text style={styles.messageLabel}>MESSAGE FROM CHRISTINA</Text>
            </View>
            <Text style={styles.messageTitle}>{messageTitle}</Text>
            <Text style={styles.messageQuote}>{messageQuote}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.watchBtn}
              activeOpacity={0.8}
              onPress={() => {
                void handleWatchIntroduction();
              }}
            >
              <Text style={styles.watchBtnText}>Watch Introduction</Text>
              <Feather name="play" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              activeOpacity={0.8}
              onPress={handleSkip}
            >
              <Text style={styles.skipBtnText}>Skip For Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
    },
    welcomeContainer: {
      marginBottom: 24,
    },
    welcomeTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.8,
      marginBottom: 8,
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    videoCard: {
      width: '100%',
      height: 200,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: 24,
      backgroundColor: '#1E2633',
    },
    videoThumbnailButton: {
      width: '100%',
      height: '100%',
    },
    videoThumbnail: {
      width: '100%',
      height: '100%',
      opacity: 0.85,
    },
    playButtonWrapper: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButtonInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    durationBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    durationText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    messageCard: {
      backgroundColor: themeState === 'dark' ? '#111827' : theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: themeState === 'dark' ? '#1E2B40' : theme.inputBorder,
      padding: 20,
      marginBottom: 32,
    },
    messageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    messageDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.secondary,
      marginRight: 8,
    },
    messageLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 1,
    },
    messageTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 10,
    },
    messageQuote: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    actionsContainer: {
      gap: 12,
    },
    watchBtn: {
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
    watchBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    skipBtn: {
      width: '100%',
      height: 54,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: themeState === 'dark' ? '#2A3649' : theme.inputBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    skipBtnText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
    },
    inlineVideo: {
      width: '100%',
      height: '100%',
    },
    videoLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(5, 11, 20, 0.35)',
    },
  });
