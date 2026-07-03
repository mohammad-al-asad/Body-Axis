import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';

import { Header } from '@/components/Header';
import { useTheme } from '@/hooks/use-theme';
import { getPhaseNumber } from '@/utils/phase';
import { sessionPlanToResetPlan } from './session-details';
import {
  MovementSession,
  SessionExercise,
  useCompleteExerciseMutation,
  useGetSessionQuery,
} from '@/redux/api/sessionApi';
import { getSavedOfflineSession, resolveOfflineVideoUri } from '@/services/offlineDownloads';

export default function ExerciseTrackerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{
    id?: string | string[];
    sessionId?: string | string[];
    initialPhaseIndex?: string | string[];
  }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const initialPhaseIndex = Array.isArray(params.initialPhaseIndex)
    ? params.initialPhaseIndex[0]
    : params.initialPhaseIndex;
  const { data: onlineSession } = useGetSessionQuery(sessionId ?? '', { skip: !sessionId });
  const [completeExercise, { isLoading: isCompletingExercise }] =
    useCompleteExerciseMutation();
  const [offlineSession, setOfflineSession] = useState<MovementSession | null>(null);
  const session = onlineSession ?? offlineSession;

  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;

    const loadOfflineSession = async () => {
      try {
        const savedSession = await getSavedOfflineSession(sessionId);
        if (isMounted) {
          setOfflineSession(savedSession);
        }
      } catch {
        if (isMounted) {
          setOfflineSession(null);
        }
      }
    };

    void loadOfflineSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const sessionPlan = useMemo(
    () =>
      session?.plans.find(
        (item) => item.plan_id === id || item.id === id,
      ),
    [id, session],
  );
  const routine = useMemo(
    () =>
      sessionPlan
        ? sessionPlanToResetPlan(
            sessionPlan,
            session?.plans.findIndex((item) => item.plan_id === sessionPlan.plan_id) ?? 0,
          )
        : null,
    [session, sessionPlan],
  );
  const dynamicExercises = useMemo<SessionExercise[]>(() => {
    if (!sessionPlan) return [];
    return ['reset', 'control', 'integrate'].flatMap(
      (phase) => sessionPlan.phases[phase as keyof typeof sessionPlan.phases],
    );
  }, [sessionPlan]);
  const phaseList = useMemo(() => routine?.phases ?? [], [routine]);
  const hasExerciseContent = Boolean(routine && dynamicExercises.length);
  const parsedInitialIndex = Number.parseInt(initialPhaseIndex ?? '0', 10);
  const safeInitialIndex = Number.isNaN(parsedInitialIndex)
    ? 0
    : Math.min(Math.max(parsedInitialIndex, 0), Math.max(phaseList.length - 1, 0));

  const [currentIdx, setCurrentIdx] = useState(safeInitialIndex);
  const [currentSet, setCurrentSet] = useState(1);
  const [repsCount, setRepsCount] = useState(10);
  const [completedExerciseKey, setCompletedExerciseKey] = useState<string | null>(null);

  const totalSets = useMemo(() => {
    const dynamicExercise = dynamicExercises[currentIdx];
    return dynamicExercise?.sets ?? 0;
  }, [dynamicExercises, currentIdx]);

  const targetReps = useMemo(() => {
    const dynamicExercise = dynamicExercises[currentIdx];
    const match = dynamicExercise?.reps ? /(\d+)/.exec(dynamicExercise.reps) : null;
    return match ? Number.parseInt(match[1]) : 0;
  }, [dynamicExercises, currentIdx]);

  const [setsData, setSetsData] = useState<{ reps: number; completed: boolean }[]>(() => {
    return Array.from({ length: totalSets }, () => ({ reps: 0, completed: false }));
  });

  // Timer states
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [timerDuration, setTimerDuration] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerStartedYet, setIsTimerStartedYet] = useState(false);
  const [isDurationDropdownVisible, setIsDurationDropdownVisible] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeVideoType, setActiveVideoType] = useState<'short' | 'full'>('short');
  const videoPlayer = useVideoPlayer(null);

  const resolvePlayableVideoUrl = async (url: string) => {
    if (!session || !sessionPlan) return url;
    const localUri = await resolveOfflineVideoUri(session.id, sessionPlan, url);
    return localUri ?? url;
  };

  const handleCloseVideo = () => {
    videoPlayer.pause();
    setIsVideoPlaying(false);
    const activeVideoUrl = activeVideoType === 'full' ? tutorialVideoUrl : shortClipUrl;
    if (!activeVideoUrl) return;
    void resolvePlayableVideoUrl(activeVideoUrl).then((playableUrl) => {
      return videoPlayer.replaceAsync(playableUrl);
    });
  };

  const handleOpenVideo = async (url?: string, videoType: 'short' | 'full' = 'short') => {
    if (url) {
      setActiveVideoType(videoType);
      await videoPlayer.replaceAsync(await resolvePlayableVideoUrl(url));
    }
    videoPlayer.currentTime = 0;
    videoPlayer.play();
    setIsVideoPlaying(true);
  };

  useEventListener(videoPlayer, 'playToEnd', handleCloseVideo);

  // Initialize/Reset states when currentIdx or totalSets changes
  useEffect(() => {
    setSetsData(
      Array.from({ length: totalSets }, () => ({ reps: 0, completed: false }))
    );
    setCurrentSet(1);
    setRepsCount(targetReps);
    setIsTimerVisible(false);
    setIsTimerRunning(false);
    setIsTimerStartedYet(false);
    setCompletedExerciseKey(null);
  }, [currentIdx, totalSets, targetReps]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerVisible && isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsTimerVisible(false);
            setIsTimerStartedYet(false);
            if (currentSet < totalSets) {
              setCurrentSet((prevSet) => prevSet + 1);
            } else {
              setCurrentSet(totalSets + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerVisible, isTimerRunning, currentSet, totalSets]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const currentPhase = useMemo(
    () =>
      phaseList[currentIdx] ??
      phaseList[0] ??
      { phase: '', name: '' },
    [currentIdx, phaseList],
  );
  const currentPhaseNumber = useMemo(
    () => getPhaseNumber(currentPhase.phase) ?? 0,
    [currentPhase.phase],
  );
  const upcomingPhase = useMemo(
    () => phaseList[currentIdx + 1],
    [currentIdx, phaseList],
  );
  const dynamicExercise = dynamicExercises[currentIdx];
  const currentExerciseKey = `${session?.id ?? 'no-session'}:${sessionPlan?.plan_id ?? sessionPlan?.id ?? 'no-plan'}:${dynamicExercise?.exercise_id ?? 'no-exercise'}`;
  const exerciseMetadata = {
    benefits: dynamicExercise?.secondary_benefits || dynamicExercise?.primary_intent || null,
    targetRegions: sessionPlan?.target_area ? [sessionPlan.target_area] : [],
    equipment: dynamicExercise?.equipment_needed ?? [],
    sets: dynamicExercise ? String(dynamicExercise.sets) : 'N/A',
    repsVal: dynamicExercise?.reps ?? 'N/A',
    repsLabel: dynamicExercise?.reps?.includes('/') ? 'REPS / EACH SIDE' : 'REPS',
  };

  const shortClipUrl = useMemo(() => {
    return (
      dynamicExercise?.short_clip_video?.video_url ||
      dynamicExercise?.tutorial_video?.video_url ||
      null
    );
  }, [dynamicExercise]);

  const thumbnailUrl = useMemo(() => {
    return (
      dynamicExercise?.short_clip_video?.thumbnail_url ||
      dynamicExercise?.tutorial_video?.thumbnail_url ||
      null
    );
  }, [dynamicExercise]);

  const tutorialVideoUrl = useMemo(() => {
    return (
      dynamicExercise?.tutorial_video?.video_url ||
      null
    );
  }, [dynamicExercise]);
  const alternateVideoTarget = useMemo(() => {
    if (shortClipUrl && tutorialVideoUrl && shortClipUrl === tutorialVideoUrl) {
      return null;
    }
    if (activeVideoType === 'full' && shortClipUrl) {
      return {
        url: shortClipUrl,
        type: 'short' as const,
        label: 'Watch Short Video',
      };
    }
    if (tutorialVideoUrl) {
      return {
        url: tutorialVideoUrl,
        type: 'full' as const,
        label: 'Watch Full Video',
      };
    }
    return null;
  }, [activeVideoType, shortClipUrl, tutorialVideoUrl]);

  useEffect(() => {
    let isMounted = true;

    const replaceWithPlayableUrl = async () => {
      if (!shortClipUrl || !session || !sessionPlan) return;
      const playableUrl =
        (await resolveOfflineVideoUri(session.id, sessionPlan, shortClipUrl)) ?? shortClipUrl;

      if (!isMounted) return;
      await videoPlayer.replaceAsync(playableUrl);
      if (!isMounted) return;
      setActiveVideoType('short');
      videoPlayer.currentTime = 0;
      videoPlayer.pause();
      setIsVideoPlaying(false);
    };

    void replaceWithPlayableUrl();

    return () => {
      isMounted = false;
    };
  }, [shortClipUrl, session, sessionPlan, videoPlayer]);

  useEffect(() => {
    if (!session?.id || !sessionPlan || !dynamicExercise) return;
    if (currentSet <= totalSets || totalSets === 0) return;
    if (completedExerciseKey === currentExerciseKey) return;

    const now = new Date();
    void completeExercise({
      sessionId: session.id,
      exerciseId: dynamicExercise.exercise_id,
      plan_id: sessionPlan.plan_id,
      completed_local_date: now.toLocaleDateString('en-CA'),
      completed_weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
    })
      .unwrap()
      .then(() => {
        setCompletedExerciseKey(currentExerciseKey);
      })
      .catch((error) => {
        console.error('Failed to complete exercise', error);
      });
  }, [
    completeExercise,
    completedExerciseKey,
    currentExerciseKey,
    currentSet,
    dynamicExercise,
    session?.id,
    sessionPlan,
    totalSets,
  ]);

  const handleLogSetPress = () => {
    if (currentSet > totalSets) return;

    // Log reps for the current set
    setSetsData((prev) => {
      const next = [...prev];
      next[currentSet - 1] = { reps: repsCount, completed: true };
      return next;
    });

    // Make timer visible in stopped mode, and set to selected duration
    setTimerSeconds(timerDuration);
    setIsTimerVisible(true);
    setIsTimerRunning(false);
    setIsTimerStartedYet(false);
  };

  const handleSkipTimer = () => {
    setIsTimerVisible(false);
    setIsTimerRunning(false);
    setIsTimerStartedYet(false);

    // Move to next set
    if (currentSet < totalSets) {
      setCurrentSet((prev) => prev + 1);
    } else {
      setCurrentSet(totalSets + 1);
    }
  };

  const handleFinishTimer = () => {
    setIsTimerVisible(false);
    setIsTimerRunning(false);
    setIsTimerStartedYet(false);

    // Move to next set
    if (currentSet < totalSets) {
      setCurrentSet((prev) => prev + 1);
    } else {
      setCurrentSet(totalSets + 1);
    }
  };

  const handleToggleTimer = () => {
    if (!isTimerStartedYet) {
      setIsTimerStartedYet(true);
    }
    const nextRunning = !isTimerRunning;
    if (nextRunning) {
      setIsDurationDropdownVisible(false);
    }
    setIsTimerRunning(nextRunning);
  };

  const handlePeriodChange = (period: number) => {
    setTimerDuration(period);
    setTimerSeconds(period);
  };

  const hasNextExerciseInPlan = currentIdx < phaseList.length - 1;

  const currentPlanIdx = useMemo(() => {
    if (!session || !sessionPlan) return -1;
    return session.plans.findIndex(
      (p) => p.plan_id === sessionPlan.plan_id || p.id === sessionPlan.id
    );
  }, [session, sessionPlan]);

  const nextPlan = useMemo(() => {
    if (currentPlanIdx === -1 || !session) return null;
    if (currentPlanIdx < session.plans.length - 1) {
      return session.plans[currentPlanIdx + 1];
    }
    return null;
  }, [session, currentPlanIdx]);

  const nextButtonText = useMemo(() => {
    if (!hasExerciseContent) {
      return 'Session unavailable';
    }
    if (hasNextExerciseInPlan) {
      const currentPhaseName = currentPhase.phase.toLowerCase();
      const nextPhaseName = upcomingPhase?.phase.toLowerCase() ?? '';
      if (currentPhaseName !== nextPhaseName) {
        return 'Next Phase';
      }
      return 'Next Exercise';
    } else if (nextPlan) {
      return `Next ${nextPlan.plan_name}`;
    } else {
      return "Finish Today's Session";
    }
  }, [hasExerciseContent, hasNextExerciseInPlan, currentPhase, upcomingPhase, nextPlan]);

  const handleNextExercise = () => {
    videoPlayer.pause();
    setIsVideoPlaying(false);

    if (hasNextExerciseInPlan) {
      setCurrentIdx((prev) => prev + 1);
      return;
    }

    if (nextPlan) {
      router.replace({
        pathname: '/sessions/exercise-tracker',
        params: {
          id: nextPlan.plan_id || nextPlan.id,
          sessionId: session?.id,
          initialPhaseIndex: '0',
        },
      });
      return;
    }

    router.replace('/');
  };

  const handleWatchFullVideo = () => {
    if (!alternateVideoTarget?.url) return;
    setIsDetailsVisible(false);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      void handleOpenVideo(alternateVideoTarget.url, alternateVideoTarget.type);
    });
  };

  const styles = createStyles(theme, isTimerRunning);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onBackPress={() => { videoPlayer.pause(); router.back(); }} showNotification />

        {/* Learn the Exercise Modal */}
        <Modal
          visible={isDetailsVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDetailsVisible(false)}
        >
          <TouchableOpacity
            style={styles.detailsModalOverlay}
            activeOpacity={1}
            onPress={() => setIsDetailsVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.detailsModalContainer}
              onPress={() => {}}
            >
              {/* Header */}
              <View style={styles.detailsModalHeader}>
                <Text style={styles.detailsModalTitle}>Learn the excercise</Text>
                <TouchableOpacity onPress={() => setIsDetailsVisible(false)} activeOpacity={0.7}>
                  <Feather name="x" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Benefits */}
                <Text style={styles.detailsSectionHeader}>BENEFITS</Text>
                <Text style={styles.detailsBenefitsText}>
                  {exerciseMetadata.benefits ?? 'Not provided'}
                </Text>

                {/* Target Regions */}
                <Text style={styles.detailsSectionHeader}>TARGET REGIONS</Text>
                <View style={styles.tagsContainer}>
                  {exerciseMetadata.targetRegions.length ? exerciseMetadata.targetRegions.map((region) => (
                    <View key={region} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{region}</Text>
                    </View>
                  )) : <Text style={styles.emptyFieldText}>Not provided</Text>}
                </View>

                {/* Equipment */}
                <Text style={styles.detailsSectionHeader}>EQUIPMENT</Text>
                <View style={styles.tagsContainer}>
                  {exerciseMetadata.equipment.length ? exerciseMetadata.equipment.map((item) => (
                    <View key={item} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{item}</Text>
                    </View>
                  )) : <Text style={styles.emptyFieldText}>Not provided</Text>}
                </View>

                {/* Grid cards */}
                <View style={styles.detailsGridRow}>
                  <View style={styles.detailsGridCard}>
                    <Feather name="layers" size={20} color={theme.secondary} style={styles.gridCardIcon} />
                    <Text style={styles.gridCardValue}>{exerciseMetadata.sets}</Text>
                    <Text style={styles.gridCardLabel}>SETS</Text>
                  </View>

                  <View style={styles.detailsGridCard}>
                    <Feather name="repeat" size={20} color={theme.secondary} style={styles.gridCardIcon} />
                    <Text style={styles.gridCardValueCompact}>{exerciseMetadata.repsVal}</Text>
                    <Text style={styles.gridCardLabel}>{exerciseMetadata.repsLabel}</Text>
                  </View>
                </View>

                {/* Watch Full Video Button */}
                <TouchableOpacity
                  style={[styles.watchFullVideoBtn, !alternateVideoTarget && styles.watchFullVideoBtnDisabled]}
                  onPress={handleWatchFullVideo}
                  activeOpacity={0.8}
                  disabled={!alternateVideoTarget}
                >
                  <Text style={[styles.watchFullVideoBtnText, !alternateVideoTarget && styles.watchFullVideoBtnTextDisabled]}>
                    {alternateVideoTarget?.label ?? 'Video Unavailable'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!hasExerciseContent ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>Exercise data unavailable</Text>
              <Text style={styles.stateText}>
                This screen no longer uses fallback routine data. Open it from a loaded session plan.
              </Text>
            </View>
          ) : (
            <>

          <View style={styles.progressHeaderRow}>
            <View>
              <Text style={styles.progressStatusText}>PLAN IN PROGRESS</Text>
              <Text style={styles.progressSubText}>
                EXERCISE {currentIdx + 1} OF {phaseList.length}
              </Text>
            </View>
          </View>

          <View style={styles.exerciseMetaSection}>
            <View style={styles.exerciseMetaRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.phaseLabel}>
                  PHASE {currentPhaseNumber}:{' '}
                  <Text style={styles.phaseLabelHighlight}>
                    {currentPhase.phase.toUpperCase()}
                  </Text>
                </Text>
                <Text style={styles.exerciseTitle}>
                  {currentPhase.name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => setIsDetailsVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.detailsBtnText}>DETAILS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Video Preview Card */}
          <View style={styles.videoCard}>
            {isVideoPlaying && shortClipUrl ? (
              <VideoView
                player={videoPlayer}
                contentFit="cover"
                nativeControls
                fullscreenOptions={{ enable: true }}
                style={styles.video}
              />
            ) : shortClipUrl && thumbnailUrl ? (
              <TouchableOpacity
                style={styles.videoThumbnailButton}
                activeOpacity={0.9}
                onPress={() => handleOpenVideo(shortClipUrl)}
              >
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={styles.videoThumbnail}
                />
                <View style={styles.videoOverlay}>
                  <View style={styles.playButtonCircle}>
                    <Feather
                      name="play"
                      size={20}
                      color="#FFF"
                      style={{ marginLeft: 2 }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <Text style={styles.videoUnavailableText}>Video unavailable</Text>
            )}
          </View>

          {/* START SET Section */}
          <Text style={styles.sectionHeader}>START SET</Text>
          <View style={[styles.startSetCard, (isTimerRunning || currentSet > totalSets) && styles.disabledCard]}>
            <Text style={styles.startSetTitle}>
              Log Set {currentSet <= totalSets ? currentSet : totalSets}
            </Text>
            <Text style={styles.startSetSubtitle}>Target: {totalSets} Sets - {exerciseMetadata.repsVal} {exerciseMetadata.repsLabel}</Text>

            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                disabled={isTimerRunning || currentSet > totalSets}
                onPress={() => setRepsCount((prev) => Math.max(1, prev - 1))}
              >
                <Feather name="minus" size={20} color={isTimerRunning || currentSet > totalSets ? theme.textSecondary : theme.text} />
              </TouchableOpacity>

              <View style={styles.repsCountContainer}>
                <Text style={styles.repsCountNumber}>{repsCount.toString().padStart(2, '0')}</Text>
                <Text style={styles.repsCountLabel}>REPS</Text>
              </View>

              <TouchableOpacity
                style={styles.counterBtn}
                disabled={isTimerRunning || currentSet > totalSets}
                onPress={() => setRepsCount((prev) => prev + 1)}
              >
                <Feather name="plus" size={20} color={isTimerRunning || currentSet > totalSets ? theme.textSecondary : theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.logSetBtn,
                (isTimerRunning || currentSet > totalSets) && styles.logSetBtnDisabled,
              ]}
              disabled={isTimerRunning || currentSet > totalSets}
              onPress={handleLogSetPress}
              activeOpacity={0.8}
            >
              <Text style={styles.logSetBtnText}>Log Set</Text>
            </TouchableOpacity>
          </View>

          {/* Timer overlay / card */}
          {isTimerVisible && (
            <View style={styles.timerCard}>
              <View style={styles.timerContentRow}>
                <View style={styles.timerContentLeft}>
                  <View style={styles.timerIconWrapper}>
                    <Feather name="clock" size={20} color={theme.secondary} />
                  </View>
                  <View style={styles.timerTextContainer}>
                    <Text style={styles.timerLabel}>REST TIMER</Text>
                    <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.skipTimerBtn}
                  onPress={handleSkipTimer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipTimerBtnText}>Skip</Text>
                  <Feather name="skip-forward" size={12} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.timerControlsRow}>
                <TouchableOpacity
                  style={[styles.durationSelect, isTimerRunning && styles.durationSelectDisabled]}
                  disabled={isTimerRunning}
                  onPress={() => setIsDurationDropdownVisible((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.durationSelectText}>{timerDuration} sec timer</Text>
                  <Feather
                    name={isDurationDropdownVisible ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={handleToggleTimer}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={isTimerRunning ? 'pause' : 'play'}
                    size={20}
                    color="#050B14"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.stopBtn,
                    !isTimerStartedYet && styles.stopBtnDisabled,
                  ]}
                  disabled={!isTimerStartedYet}
                  onPress={handleFinishTimer}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="square"
                    size={16}
                    color={isTimerStartedYet ? theme.text : theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Inline Selection Dropdown Box */}
              {isDurationDropdownVisible && (
                <View style={styles.inlineDropdownBox}>
                  {[30, 45, 60, 90].map((period, idx, arr) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.inlineDropdownOption,
                        timerDuration === period && styles.inlineDropdownOptionActive,
                        idx === arr.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => {
                        handlePeriodChange(period);
                        setIsDurationDropdownVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.inlineDropdownOptionText,
                          timerDuration === period && styles.inlineDropdownOptionTextActive,
                        ]}
                      >
                        {period} sec timer
                      </Text>
                      {timerDuration === period && (
                        <Feather name="check" size={14} color={theme.secondary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* SET BREAKDOWN Section */}
          <Text style={styles.sectionHeader}>SET BREAKDOWN</Text>
          <View style={styles.breakdownContainer}>
            {setsData.slice(0, Math.min(currentSet, totalSets)).map((item, index) => {
              const setNum = index + 1;
              const isActive = setNum === currentSet;

              return (
                <View
                  key={index}
                  style={[
                    styles.breakdownItem,
                    isActive && styles.breakdownItemActive,
                  ]}
                >
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownIconWrapper,
                        item.completed && styles.breakdownIconWrapperCompleted,
                        isActive && styles.breakdownIconWrapperActive,
                      ]}
                    >
                      {item.completed ? (
                        <Feather name="check" size={12} color="#10B981" />
                      ) : isActive ? (
                        <Feather name="clock" size={12} color="#22D3EE" />
                      ) : (
                        <Feather name="circle" size={12} color={theme.textSecondary} />
                      )}
                    </View>

                    <View>
                      <Text style={styles.breakdownTitle}>Set {setNum}</Text>
                      <Text style={styles.breakdownStatus}>
                        {item.completed ? 'COMPLETED' : isActive ? 'CURRENT PHASE' : 'PENDING'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.breakdownReps}>
                    {item.completed ? item.reps.toString().padStart(2, '0') : '00'}/{targetReps}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Upcoming Section */}
          <Text style={styles.upcomingHeader}>UPCOMING</Text>
          {upcomingPhase ? (
            <View style={styles.upcomingCard}>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingPhaseType}>
                  PHASE : {upcomingPhase.phase.toUpperCase()}
                </Text>
                <Text style={styles.upcomingName} numberOfLines={1}>
                  {upcomingPhase.name}
                </Text>
              </View>
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>NEXT</Text>
              </View>
            </View>
          ) : (
            <View style={styles.upcomingCard}>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingPhaseType}>ROUTINE COMPLETE NEXT</Text>
                <Text style={styles.upcomingName}>Finish up and log your routine</Text>
              </View>
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>END</Text>
              </View>
            </View>
          )}
            </>
          )}
        </ScrollView>

        {/* Footer next exercise button */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[
              styles.nextExerciseBtn,
              (!hasExerciseContent ||
                isTimerRunning ||
                currentSet <= totalSets ||
                isCompletingExercise) &&
                styles.nextExerciseBtnDisabled,
            ]}
            disabled={
              !hasExerciseContent ||
              isTimerRunning ||
              currentSet <= totalSets ||
              isCompletingExercise
            }
            onPress={handleNextExercise}
            activeOpacity={0.8}
          >
            <Text style={styles.nextExerciseBtnText}>
              {isCompletingExercise ? 'Saving Progress...' : nextButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, isTimerRunning: boolean) =>
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
      paddingTop: 20,
      paddingBottom: 100,
    },
    stateCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 20,
      padding: 24,
      marginTop: 8,
      alignItems: 'center',
      gap: 12,
    },
    stateTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    stateText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 20,
    },
    backContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backIcon: {
      marginRight: 8,
    },
    backText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.tertiary,
    },
    progressHeaderRow: {
      marginBottom: 16,
    },
    progressStatusText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 1.2,
      marginBottom: 4,
    },
    progressSubText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    exerciseMetaSection: {
      marginBottom: 16,
    },
    exerciseMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    phaseLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    phaseLabelHighlight: {
      color: '#C084FC',
    },
    exerciseTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.5,
      lineHeight: 28,
    },
    detailsBtn: {
      alignSelf: 'flex-start',
      marginTop: 2,
    },
    detailsBtnText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 0.5,
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
    videoThumbnail: {
      width: '100%',
      height: '100%',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    videoThumbnailButton: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    videoUnavailableText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    videoOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButtonCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    videoLabel: {
      position: 'absolute',
      top: 12,
      left: 12,
      fontSize: 8,
      fontWeight: '800',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      letterSpacing: 0.8,
    },
    sectionHeader: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 10,
    },
    startSetCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      alignItems: 'center',
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    disabledCard: {
      opacity: 0.5,
    },
    startSetTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 2,
    },
    startSetSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 20,
    },
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      marginBottom: 24,
    },
    counterBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    repsCountContainer: {
      alignItems: 'center',
      minWidth: 80,
    },
    repsCountNumber: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.secondary,
    },
    repsCountLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.5,
      marginTop: 2,
    },
    logSetBtn: {
      width: '100%',
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logSetBtnDisabled: {
      borderColor: theme.cardBorder,
    },
    logSetBtnText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },
    timerCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 20,
      padding: 16,
      marginBottom: 24,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    timerContentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    timerContentLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    skipTimerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    skipTimerBtnText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    timerIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.inputBackground,
      borderWidth: 1.5,
      borderColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerTextContainer: {
      justifyContent: 'center',
    },
    timerLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    timerText: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.secondary,
    },
    timerControlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 16,
    },
    durationSelect: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      backgroundColor: theme.inputBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    durationSelectDisabled: {
      opacity: 0.6,
    },
    durationSelectText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    playBtn: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stopBtn: {
      width: 48,
      height: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.text,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stopBtnDisabled: {
      borderColor: theme.inputBorder,
    },
    inlineDropdownBox: {
      marginTop: 12,
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      overflow: 'hidden',
    },
    inlineDropdownOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.inputBorder,
    },
    inlineDropdownOptionActive: {
      backgroundColor: theme.backgroundSelected,
    },
    inlineDropdownOptionText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    inlineDropdownOptionTextActive: {
      color: theme.secondary,
      fontWeight: '700',
    },

    breakdownContainer: {
      marginBottom: 24,
      gap: 12,
    },
    breakdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      padding: 16,
    },
    breakdownItemActive: {
      borderColor: theme.secondary,
    },
    breakdownLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    breakdownIconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    breakdownIconWrapperCompleted: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    breakdownIconWrapperActive: {
      backgroundColor: theme.secondary + '1A',
    },
    breakdownTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 2,
    },
    breakdownStatus: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    breakdownReps: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    upcomingHeader: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 10,
    },
    upcomingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    upcomingInfo: {
      flex: 1,
      paddingRight: 12,
    },
    upcomingPhaseType: {
      fontSize: 8,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    upcomingName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    nextBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    nextBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    footerRow: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
    },
    nextExerciseBtn: {
      width: '100%',
      height: 50,
      borderRadius: 14,
      backgroundColor: '#1D4ED8', // Solid deep blue
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#1D4ED8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    nextExerciseBtnDisabled: {
      backgroundColor: theme.inputBackground,
      shadowColor: 'transparent',
      elevation: 0,
      opacity: 0.5,
    },
    nextExerciseBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
    detailsModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    detailsModalContainer: {
      width: '100%',
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      maxHeight: '85%',
    },
    detailsModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    detailsModalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
    },
    detailsSectionHeader: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 1.0,
      marginBottom: 12,
      marginTop: 18,
    },
    detailsBenefitsText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
      opacity: 0.9,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    emptyFieldText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    tagBadge: {
      backgroundColor: theme.backgroundSelected,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
    },
    detailsGridRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
      marginBottom: 24,
    },
    detailsGridCard: {
      flex: 1,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    },
    gridCardIcon: {
      marginBottom: 8,
    },
    gridCardValue: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 4,
    },
    gridCardValueCompact: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    gridCardLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    watchFullVideoBtn: {
      width: '100%',
      height: 48,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    },
    watchFullVideoBtnDisabled: {
      borderColor: theme.inputBorder,
    },
    watchFullVideoBtnText: {
      color: theme.secondary,
      fontSize: 14,
      fontWeight: '800',
    },
    watchFullVideoBtnTextDisabled: {
      color: theme.textSecondary,
    },

  });
