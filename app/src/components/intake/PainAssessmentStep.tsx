import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { CustomTab } from "@/components/ui/CustomTab";
import { CustomButton } from "@/components/ui/CustomButton";

const femaleFront = require("@/assets/images/avatar/femaleFront.png");
const femaleBack = require("@/assets/images/avatar/femaleBack.png");
const menFront = require("@/assets/images/avatar/menFront.png");
const menBack = require("@/assets/images/avatar/menBack.png");

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PainHotspot {
  id: string;
  label: string;
  top: string;
  left: string;
}

const frontHotspots: PainHotspot[] = [
  { id: "shoulder_front", label: "Shoulder", top: "27%", left: "60%" },
  { id: "hips_front", label: "Hips", top: "45%", left: "40%" },
  { id: "foot_ankle_front", label: "FOOT/ANKLE", top: "78%", left: "39%" },
];

const backHotspots: PainHotspot[] = [
  { id: "shoulder_back", label: "Shoulder", top: "27%", left: "42%" },
  { id: "hips_back", label: "Hips", top: "42%", left: "60%" },
  { id: "glutes", label: "Glutes", top: "45%", left: "45%" },
  { id: "neck_upper_back", label: "NECK/UPPER BACK", top: "25%", left: "52%" },
  { id: "middle_back", label: "MIDDLE BACK", top: "32%", left: "52%" },
  { id: "lower_back", label: "LOWER BACK", top: "39%", left: "52%" },
  { id: "foot_ankle_back", label: "FOOT/ANKLE", top: "78%", left: "41%" },
];

interface PainAssessmentStepProps {
  userGender: string;
  avatarView: "front" | "back";
  setAvatarView: (val: "front" | "back") => void;
  selectedPainPoints: string[];
  togglePainPoint: (label: string) => void;
  onNext: () => void;
}

export function PainAssessmentStep({
  userGender,
  avatarView,
  setAvatarView,
  selectedPainPoints,
  togglePainPoint,
  onNext,
}: PainAssessmentStepProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const getAvatarAsset = () => {
    if (userGender === "male") {
      return avatarView === "front" ? menFront : menBack;
    }
    return avatarView === "front" ? femaleFront : femaleBack;
  };

  return (
    <View style={styles.slide}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, marginTop: 24 }}>
        <Text style={styles.title}>Where are you experiencing discomfort?</Text>
        <Text style={styles.subtitle}>
          Tap the areas on the 3D visualizer to pinpoint your pain points.
        </Text>
        <View style={[styles.avatarWrapper, { minHeight: 550 }]}>
          <CustomTab
            style={{
              alignSelf: "center",
              width: 220,
              height: 40,
              zIndex: 10,
              borderWidth: 1,
              borderColor: theme.grayBorder,
            }}
            options={[
              { label: "Front", value: "front" },
              { label: "Back", value: "back" },
            ]}
            selectedValue={avatarView}
            onSelect={(val) => setAvatarView(val as "front" | "back")}
          />

          <Image source={getAvatarAsset()} style={styles.avatarImg} resizeMode="cover" />

          {(avatarView === "front" ? frontHotspots : backHotspots).map((spot) => {
            const isSelected = selectedPainPoints.includes(spot.label);
            return (
              <View
                key={spot.id}
                style={{ position: 'absolute', top: spot.top, left: spot.left, zIndex: isSelected ? 20 : 1 }}
              >
                <TouchableOpacity
                  style={styles.hotspotTouchTarget}
                  onPress={() => togglePainPoint(spot.label)}
                  activeOpacity={0.6}
                >
                  <View style={[styles.hotspotRing, isSelected && styles.hotspotRingSelected]}>
                    {isSelected && <View style={styles.hotspotDot} />}
                  </View>
                </TouchableOpacity>

                {isSelected && parseInt(spot.left) < 50 && (
                  <View style={{ position: 'absolute', right: 0, top: -7, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: theme.secondary, fontSize: 9, fontWeight: '800', marginRight: 6, letterSpacing: 0.5 }}>
                      {spot.label.toUpperCase()}
                    </Text>
                    <View style={{ width: 30, height: 1, backgroundColor: theme.secondary, shadowColor: theme.secondary, shadowOpacity: 0.8, shadowRadius: 4 }} />
                  </View>
                )}

                {isSelected && parseInt(spot.left) >= 50 && (
                  <View style={{ position: 'absolute', left: 0, top: -7, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 30, height: 1, backgroundColor: theme.secondary, shadowColor: theme.secondary, shadowOpacity: 0.8, shadowRadius: 4 }} />
                    <Text style={{ color: theme.secondary, fontSize: 9, fontWeight: '800', marginLeft: 6, letterSpacing: 0.5 }}>
                      {spot.label.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Footer inside scroll */}
        <View style={styles.footer}>
          <CustomButton
            title="Continue"
            onPress={onNext}
            disabled={selectedPainPoints.length === 0}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    slide: {
      width: SCREEN_WIDTH,
      paddingHorizontal: 24,
      flex: 1,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.6,
      marginBottom: 8,
      lineHeight: 34,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    avatarWrapper: {
      flex: 1,
      position: "relative",
    },
    avatarImg: {
      width: "100%",
      height: "75%",
      marginTop: 10,
    },
    hotspotTouchTarget: {
      position: "absolute",
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      transform: [{ translateX: -22 }, { translateY: -22 }],
    },
    hotspotRing: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#fff",
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    hotspotRingSelected: {
      borderColor: theme.secondary,
      backgroundColor: "rgba(93,230,255,0.2)",
    },
    hotspotDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.secondary,
    },
    footer: {
      paddingTop: 24,
      paddingBottom: 24,
    },
    actionBtn: {
      width: "100%",
    },
  });
