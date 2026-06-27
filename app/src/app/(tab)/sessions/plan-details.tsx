import React, { useMemo, useState } from 'react';
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
import { PLANS, sessionPlanToResetPlan } from './session-details';
import { Header } from '@/components/Header';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useVideoPlayer, VideoView } from 'expo-video';
import { DEMO_VIDEO_THUMBNAIL_URL, ISLAMIC_DEMO_VIDEO_URL } from '@/constants/videos';
import { SessionExercise, useGetSessionQuery } from '@/redux/api/sessionApi';

const EXERCISE_DETAILS: Record<string, {
  benefits: string;
  targetRegions: string[];
  equipment: string[];
  avoidIf: string;
  sets: string;
  reps: string;
}> = {
  'Side-Lying Thoracic Rotation (Open Book)': {
    benefits: 'Gently restores mid-back rotation with the lower back blocked from compensating. Reduces upper back stiffness that drives neck pain, shoulder restriction, and lower back overload.',
    targetRegions: ['Shoulder', 'Neck', 'Middle Back', 'Upper Back', 'Lower Back'],
    equipment: ['Mat', 'Light Dumbbell'],
    avoidIf: 'Painful rotation',
    sets: '2',
    reps: '6-10 / EACH SIDE',
  },
  'Prone Trap Raise': {
    benefits: 'Strengthens the lower trapezius muscles to improve scapular depression and upward rotation, reducing neck strain and impingement risks.',
    targetRegions: ['Upper Back', 'Shoulder', 'Middle Back'],
    equipment: ['Mat'],
    avoidIf: 'Shoulder pinching or impingement pain',
    sets: '2',
    reps: '12 / EACH SIDE',
  },
  'Side-Lying Shoulder External Rotation': {
    benefits: 'Targets the infraspinatus and teres minor to stabilize the humeral head, balancing shoulder joint dynamics.',
    targetRegions: ['Rotator Cuff', 'Shoulder'],
    equipment: ['Resistance Band', 'Mat'],
    avoidIf: 'Sharp pain in the front of the shoulder',
    sets: '2',
    reps: '10 / EACH SIDE',
  },
  'Suboccipital Release + Chin Nod': {
    benefits: 'Relieves tension in suboccipital muscles at the base of skull, restoring cervical alignment and correcting forward head posture.',
    targetRegions: ['Neck', 'Upper Back', 'Base of Skull'],
    equipment: ['Massage Ball'],
    avoidIf: 'Dizziness or numbness down the arms',
    sets: '2',
    reps: '10s HOLD',
  },
  'Serratus Wall Slide': {
    benefits: 'Activates the serratus anterior to encourage healthy scapular upward rotation and ribcage alignment.',
    targetRegions: ['Serratus Anterior', 'Shoulder', 'Ribs'],
    equipment: ['Foam Roller', 'Wall'],
    avoidIf: 'Inability to reach overhead without arching lower back',
    sets: '2',
    reps: '10 REPS',
  },
  'Side-Lying Low Trap Raise': {
    benefits: 'Strengthens lower traps in a side-lying position, isolating shoulder blade stability under controlled gravity.',
    targetRegions: ['Shoulder Blade', 'Lower Traps', 'Upper Back'],
    equipment: ['Mat', 'Light Dumbbell'],
    avoidIf: 'Neck tension or shoulder joint clicking',
    sets: '2',
    reps: '10 / EACH SIDE',
  },
  'Short Foot Activation Hold': {
    benefits: 'Activates intrinsic foot muscles to lift the medial longitudinal arch, rebuilding natural foot stability and balance.',
    targetRegions: ['Foot Arch', 'Ankle', 'Plantar Fascia'],
    equipment: ['Mat'],
    avoidIf: 'Foot cramping (relax and try again with less intensity)',
    sets: '2',
    reps: '5 x 10s HOLD',
  },
  'Standing Soleus Knee Bend Hold': {
    benefits: 'Targets soleus muscle strength and tendon stiffness to increase ankle dorsiflexion mobility.',
    targetRegions: ['Calf', 'Achilles Tendon', 'Ankle Joint'],
    equipment: ['Strap Loop', 'Wall'],
    avoidIf: 'Achilles tendon pain or pinches',
    sets: '2',
    reps: '30s HOLD',
  },
  'Single-Leg RNT Squat': {
    benefits: 'Uses reactive neuromuscular training to correct knee valgus and build lateral ankle and hip control.',
    targetRegions: ['Glute Medius', 'Ankle Stabilizers', 'Knee Joint'],
    equipment: ['Resistance Band', 'Mat'],
    avoidIf: 'Loss of balance or sharp knee patellar pain',
    sets: '2',
    reps: '10 / EACH SIDE',
  },
  'Full Body Foam Roll & Lacrosse Release': {
    benefits: 'Uses a Foam Roller and Lacrosse Ball to release trigger points, restore soft-tissue quality, and increase systemic range of motion.',
    targetRegions: ['Glutes', 'Calves', 'Upper Back', 'Foot Arch'],
    equipment: ['Foam Roller', 'Lacrosse Ball'],
    avoidIf: 'Severe muscle strain, bruising, or acute bone fractures.',
    sets: '3',
    reps: '60s HOLD',
  },
  'Banded Dumbbell Bench Press': {
    benefits: 'Combines resistance band tension and dumbbells on a gym bench to load and stabilize the shoulders and chest through a controlled range.',
    targetRegions: ['Chest', 'Shoulders', 'Triceps'],
    equipment: ['Resistance Band', 'Dumbbell', 'Bench'],
    avoidIf: 'Shoulder impingement or pain during horizontal pressing.',
    sets: '3',
    reps: '10 REPS',
  },
  'Yoga Block Squat Calibration': {
    benefits: 'Utilizes a Yoga Block between the knees and a Mini Band around the thighs to optimize hip alignment and foot arch stability during squats.',
    targetRegions: ['Glutes', 'Hips', 'Quads', 'Core'],
    equipment: ['Yoga Mat', 'Yoga Block', 'Mini Band'],
    avoidIf: 'Sharp knee patellar pain or back stiffness.',
    sets: '3',
    reps: '12 REPS',
  },
};

const DEFAULT_DETAILS = {
  benefits: 'Gently restores mobility and movement capability with the targeted area blocked from compensation. Improves neural activation and reduces stiffness.',
  targetRegions: ['Shoulder', 'Neck', 'Back'],
  equipment: ['Mat'],
  avoidIf: 'Sharp pain or severe discomfort',
  sets: '2',
  reps: '10 reps',
};

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
  const { data: session } = useGetSessionQuery(sessionId ?? '', { skip: !sessionId });

  const sessionPlan = useMemo(
    () =>
      session?.plans.find(
        (item) => item.plan_id === id || item.id === id,
      ),
    [id, session],
  );
  const plan = sessionPlan
    ? sessionPlanToResetPlan(
        sessionPlan,
        session?.plans.findIndex((item) => item.plan_id === sessionPlan.plan_id) ?? 0,
        session?.plans.length ?? 1,
      )
    : PLANS.find((r) => r.id === id) || PLANS[0];
  const dynamicExercises = useMemo<SessionExercise[]>(() => {
    if (!sessionPlan) return [];
    return ['reset', 'control', 'integrate'].flatMap(
      (phase) => sessionPlan.phases[phase as keyof typeof sessionPlan.phases],
    );
  }, [sessionPlan]);

  // Track expanded cards (default expand index 0)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isDemoVideoStarted, setIsDemoVideoStarted] = useState(false);
  const demoVideoPlayer = useVideoPlayer(ISLAMIC_DEMO_VIDEO_URL);

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

  const handlePlayDemo = (videoUrl: string) => {
    demoVideoPlayer.replace(videoUrl);
    demoVideoPlayer.currentTime = 0;
    demoVideoPlayer.play();
    setIsDemoVideoStarted(true);
  };

  const handleStartProtocol = () => {
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
        <Header onBackPress={handleBack} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Plan Title */}
          <Text style={styles.planTitle}>{plan.title}</Text>

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
            const dynamicExercise = dynamicExercises[index];
            const details = dynamicExercise
              ? {
                  benefits:
                    dynamicExercise.secondary_benefits ||
                    dynamicExercise.primary_intent ||
                    DEFAULT_DETAILS.benefits,
                  targetRegions: sessionPlan ? [sessionPlan.target_area] : DEFAULT_DETAILS.targetRegions,
                  equipment: dynamicExercise.equipment_needed.length
                    ? dynamicExercise.equipment_needed
                    : DEFAULT_DETAILS.equipment,
                  avoidIf: DEFAULT_DETAILS.avoidIf,
                  sets: String(dynamicExercise.sets),
                  reps: dynamicExercise.reps,
                }
              : EXERCISE_DETAILS[phase.name] || DEFAULT_DETAILS;
            const thumbnailUrl =
              dynamicExercise?.tutorial_video?.thumbnail_url ||
              dynamicExercise?.short_clip_video?.thumbnail_url ||
              DEMO_VIDEO_THUMBNAIL_URL;
            const videoUrl =
              dynamicExercise?.tutorial_video?.video_url ||
              dynamicExercise?.short_clip_video?.video_url ||
              ISLAMIC_DEMO_VIDEO_URL;

            return (
              <View key={index} style={styles.phaseCard}>
                <TouchableOpacity onPress={() => toggleExpand(index)} activeOpacity={0.9}>
                  {/* Phase Badge */}
                  <View style={styles.badgeWrapper}>
                    <View style={styles.phaseBadge}>
                      <Text style={styles.phaseBadgeText}>
                        PHASE {index + 1} - {phase.phase}
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
                      {isDemoVideoStarted ? (
                        <VideoView
                          player={demoVideoPlayer}
                          contentFit="cover"
                          nativeControls
                          fullscreenOptions={{ enable: true }}
                          style={styles.video}
                        />
                      ) : (
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
                      )}
                    </View>

                    {/* Benefits */}
                    <Text style={styles.sectionHeader}>BENEFITS</Text>
                    <Text style={styles.sectionBody}>{details.benefits}</Text>

                    {/* Target Regions */}
                    <Text style={styles.sectionHeader}>TARGET REGIONS</Text>
                    <View style={styles.badgeRow}>
                      {details.targetRegions.map((region, rIdx) => (
                        <View key={rIdx} style={styles.regionBadge}>
                          <Text style={styles.regionBadgeText}>{region}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Equipment */}
                    <Text style={styles.sectionHeader}>EQUIPMENT</Text>
                    <View style={styles.badgeRow}>
                      {details.equipment.map((eq, eIdx) => (
                        <View key={eIdx} style={styles.regionBadge}>
                          <Text style={styles.regionBadgeText}>{eq}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Avoid If warning */}
                    <View style={styles.avoidIfContainer}>
                      <View style={styles.avoidIfTitleRow}>
                        <Feather name="alert-triangle" size={13} color={theme.error} style={{ marginRight: 6 }} />
                        <Text style={styles.avoidIfTitle}>AVOID IF</Text>
                      </View>
                      <Text style={styles.avoidIfText}>{details.avoidIf}</Text>
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
                    <Text style={styles.gridVal}>{details.reps.split(' ')[0]}</Text>
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
        </ScrollView>

        {/* Start Plan Fixed Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startProtocolBtn}
            activeOpacity={0.8}
            onPress={handleStartProtocol}
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
      paddingBottom: 100, // Leave space for floating footer button
    },
    planTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginTop: 8,
      marginBottom: 12,
      letterSpacing: -0.6,
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
    startProtocolText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });
