import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { sessionPlanToResetPlan } from './session-details';
import { getPhaseNumber } from '@/utils/phase';
import { Header } from '@/components/Header';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MovementSession, SessionExercise, useGetSessionQuery } from '@/redux/api/sessionApi';
import { getSavedOfflineSession, resolveOfflineVideoUri } from '@/services/offlineDownloads';

export default function PlanDetailsScreen() {
  const theme = useTheme();
  const themePreference = useSelector((state: RootState) => state.settings.theme);
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    sessionId?: string | string[];
  }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const { data: onlineSession } = useGetSessionQuery(sessionId ?? '', { skip: !sessionId });
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
  const plan = useMemo(
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
  const hasPlanContent = Boolean(plan && dynamicExercises.length);

  // Track expanded cards (default expand index 0)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isDemoVideoStarted, setIsDemoVideoStarted] = useState(false);
  const demoVideoPlayer = useVideoPlayer(null);

  useEventListener(demoVideoPlayer, 'playToEnd', () => {
    demoVideoPlayer.pause();
    setIsDemoVideoStarted(false);
  });

  const toggleExpand = (index: number) => {
    demoVideoPlayer.pause();
    demoVideoPlayer.currentTime = 0;
    setIsDemoVideoStarted(false);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handlePlayDemo = async (videoUrl: string) => {
    if (!session || !sessionPlan) return;
    const localUri = await resolveOfflineVideoUri(session.id, sessionPlan, videoUrl);
    await demoVideoPlayer.replaceAsync(localUri ?? videoUrl);
    demoVideoPlayer.currentTime = 0;
    demoVideoPlayer.play();
    setIsDemoVideoStarted(true);
  };

  const handleStartProtocol = () => {
    if (!plan) return;
    demoVideoPlayer.pause();
    router.push({
      pathname: '/sessions/exercise-tracker',
      params: {
        id: plan.id,
        ...(session?.id ? { sessionId: session.id } : {}),
      },
    });
  };

  const handleBack = () => {
    demoVideoPlayer.pause();
    router.back();
  };

  const styles = createStyles(theme, themePreference);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Header />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.backContainer}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={16} color={theme.tertiary} style={styles.backIcon} />
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>

          {!plan || !hasPlanContent ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>Plan details unavailable</Text>
              <Text style={styles.stateText}>
                This screen only renders session-backed plan data. Reopen the session and try again.
              </Text>
            </View>
          ) : (
            <>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>All Exercises for : {plan.title}</Text>
          </View>

          {/* Plan Metadata Sub-row */}
          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              <Feather name="clock" size={14} color={theme.secondary} style={styles.metaIcon} />
              <Text style={styles.metaDurationText}>{plan.duration}</Text>
            </View>
            <View style={styles.metaRight}>
              <Text style={styles.equipmentLabel}>
                Equipment:{' '}
                <Text style={styles.equipmentNamesText}>
                  {plan.equipment.map((eq) => eq.name).join(' • ')}
                </Text>
              </Text>
            </View>
          </View>

          {/* Phases List */}
          {plan.phases.map((phase, index) => {
            const isExpanded = expandedIndex === index;
            const phaseNumber = getPhaseNumber(phase.phase) ?? index + 1;
            const dynamicExercise = dynamicExercises[index];
            const details = {
              benefits: dynamicExercise?.secondary_benefits || dynamicExercise?.primary_intent || null,
              targetRegions: sessionPlan?.target_area ? [sessionPlan.target_area] : [],
              equipment: dynamicExercise?.equipment_needed ?? [],
              avoidIf: null,
              sets: dynamicExercise ? String(dynamicExercise.sets) : 'N/A',
              reps: dynamicExercise?.reps ?? 'N/A',
            };
            const thumbnailUrl =
              dynamicExercise?.tutorial_video?.thumbnail_url ||
              dynamicExercise?.short_clip_video?.thumbnail_url ||
              null;
            const videoUrl =
              dynamicExercise?.tutorial_video?.video_url ||
              dynamicExercise?.short_clip_video?.video_url ||
              null;

            return (
              <View key={index} style={styles.phaseCard}>
                <TouchableOpacity onPress={() => toggleExpand(index)} activeOpacity={0.9}>
                  {/* Phase Badge */}
                  <View style={styles.badgeWrapper}>
                    <View style={styles.phaseBadge}>
                      <Text style={styles.phaseBadgeText}>
                        PHASE {phaseNumber} - {phase.phase}
                      </Text>
                    </View>
                  </View>

                  {/* Phase Title */}
                  <Text style={styles.phaseTitle}>{phase.name}</Text>
                </TouchableOpacity>

                {/* Expandable Section */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {/* Video Player */}
                    <View style={styles.videoPlayer}>
                      {isDemoVideoStarted && videoUrl ? (
                        <VideoView
                          player={demoVideoPlayer}
                          contentFit="cover"
                          nativeControls
                          fullscreenOptions={{ enable: true }}
                          style={styles.video}
                        />
                      ) : videoUrl && thumbnailUrl ? (
                        <TouchableOpacity
                          style={styles.videoThumbnailButton}
                          activeOpacity={0.9}
                          onPress={() => handlePlayDemo(videoUrl)}
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

                    {/* Benefits */}
                    <Text style={styles.sectionHeader}>BENEFITS</Text>
                    <Text style={styles.sectionBody}>{details.benefits ?? 'Not provided'}</Text>

                    {/* Target Regions */}
                    <Text style={styles.sectionHeader}>TARGET REGIONS</Text>
                    <View style={styles.badgeRow}>
                      {details.targetRegions.length ? details.targetRegions.map((region, rIdx) => (
                        <View key={rIdx} style={styles.regionBadge}>
                          <Text style={styles.regionBadgeText}>{region}</Text>
                        </View>
                      )) : <Text style={styles.emptyFieldText}>Not provided</Text>}
                    </View>

                    {/* Equipment */}
                    <Text style={styles.sectionHeader}>EQUIPMENT</Text>
                    <View style={styles.badgeRow}>
                      {details.equipment.length ? details.equipment.map((eq, eIdx) => (
                        <View key={eIdx} style={styles.regionBadge}>
                          <Text style={styles.regionBadgeText}>{eq}</Text>
                        </View>
                      )) : <Text style={styles.emptyFieldText}>Not provided</Text>}
                    </View>

                    {/* Avoid If warning */}
                    <View style={styles.avoidIfContainer}>
                      <View style={styles.avoidIfTitleRow}>
                        <Feather name="alert-triangle" size={13} color={theme.error} style={{ marginRight: 6 }} />
                        <Text style={styles.avoidIfTitle}>AVOID IF</Text>
                      </View>
                      <Text style={styles.avoidIfText}>{details.avoidIf ?? 'Not provided'}</Text>
                    </View>
                  </View>
                )}

                {/* Grid (Sets/Reps) */}
                <View style={styles.gridContainer}>
                  <View style={styles.gridBox}>
                    <Feather name="layers" size={14} color={theme.secondary} style={styles.gridIcon} />
                    <Text style={styles.gridVal}>{details.sets}</Text>
                    <Text style={styles.gridLabel}>SETS</Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Feather name="repeat" size={14} color={theme.secondary} style={styles.gridIcon} />
                    <Text style={styles.gridVal}>{details.reps.split(' ')[0] || 'N/A'}</Text>
                    <Text style={styles.gridLabel}>
                      {details.reps.includes('/') ? 'REPS / EACH SIDE' : 'REPS'}
                    </Text>
                  </View>
                </View>

                {/* Action button to toggle collapse/expand state */}
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.detailsButtonText}>
                    {isExpanded ? 'Collapse' : 'See Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
            </>
          )}
        </ScrollView>

        {/* Start Plan Fixed Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startProtocolBtn, !hasPlanContent && styles.startProtocolBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleStartProtocol}
            disabled={!hasPlanContent}
          >
            <Text style={styles.startProtocolText}>Start Plan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themePreference?: string) =>
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
      paddingTop: 16,
      paddingBottom: 100, // Leave space for floating footer button
    },
    backContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
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
    titleContainer: {
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    mainTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'left',
      marginBottom: 10,
      letterSpacing: -0.5,
    },
    stateCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 20,
      padding: 24,
      marginTop: 16,
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
    metaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 24,
      gap: 16,
    },
    metaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBackground,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    metaIcon: {
      marginRight: 6,
    },
    metaDurationText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
    },
    metaRight: {
      flex: 1,
      flexShrink: 1,
      marginLeft: 4,
    },
    equipmentLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '700',
      flexShrink: 1,
    },
    equipmentNamesText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#A855F7',
    },
    phaseCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    badgeWrapper: {
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    phaseBadge: {
      backgroundColor: 'rgba(93, 230, 255, 0.12)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    phaseBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 0.8,
    },
    phaseTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 16,
    },
    expandedContent: {
      marginTop: 4,
    },
    videoPlayer: {
      height: 180,
      borderRadius: 16,
      backgroundColor: '#0F172A',
      marginBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    videoThumbnailButton: {
      width: '100%',
      height: '100%',
    },
    videoThumbnail: {
      width: '100%',
      height: '100%',
    },
    videoUnavailableText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    videoOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButtonCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(93, 230, 255, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#5DE6FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    videoLabel: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      fontSize: 9,
      fontWeight: '800',
      color: 'rgba(255, 255, 255, 0.75)',
      letterSpacing: 1,
    },
    sectionHeader: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 1.0,
      marginBottom: 8,
    },
    sectionBody: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 20,
      marginBottom: 20,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    emptyFieldText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    regionBadge: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    regionBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    avoidIfContainer: {
      backgroundColor: theme.error + '10',
      borderColor: theme.error + '25',
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      marginBottom: 20,
    },
    avoidIfTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    avoidIfTitle: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.error,
      letterSpacing: 1.0,
    },
    avoidIfText: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 18,
    },
    gridContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    gridBox: {
      flex: 1,
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gridIcon: {
      marginBottom: 6,
    },
    gridVal: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 2,
    },
    gridLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.8,
    },
    detailsButton: {
      width: '100%',
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: themePreference === 'light' ? '#cdcdcdff' : theme.cardBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailsButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
    },
    startProtocolBtn: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    startProtocolBtnDisabled: {
      backgroundColor: theme.inputBackground,
      shadowColor: 'transparent',
      elevation: 0,
    },
    startProtocolText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });
