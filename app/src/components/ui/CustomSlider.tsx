import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder, Animated, LayoutChangeEvent } from "react-native";
import { useTheme } from "@/hooks/use-theme";

interface CustomSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onValueChange: (val: number) => void;
  activeColor?: string;
}

export function CustomSlider({ label, value, min, max, onValueChange, activeColor }: CustomSliderProps) {
  const theme = useTheme();
  const color = activeColor || theme.secondary;
  const [trackWidth, setTrackWidth] = useState(0);
  const steps = max - min;
  
  // Calculate current percentage based on value
  const percentage = (value - min) / steps;
  
  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const handlePan = (dx: number, startX: number) => {
    if (trackWidth === 0) return;
    let newX = startX + dx;
    if (newX < 0) newX = 0;
    if (newX > trackWidth) newX = trackWidth;
    
    const newPercentage = newX / trackWidth;
    const rawValue = min + newPercentage * steps;
    const snappedValue = Math.round(rawValue);
    
    if (snappedValue !== value) {
      onValueChange(snappedValue);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        // Optional: snap immediately to tap position
        // handlePan(0, locationX); 
      },
      onPanResponderMove: (evt, gestureState) => {
        // We use the initial tap X and add the dx (delta X)
        handlePan(gestureState.dx, evt.nativeEvent.locationX - gestureState.dx);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.value, { color: color }]}>{value}</Text>
      </View>

      <View style={styles.trackContainer} onLayout={handleLayout} {...panResponder.panHandlers}>
        <View style={[styles.trackBackground, { backgroundColor: theme.cardBorder }]} />
        <View style={[styles.trackFill, { backgroundColor: color, width: `${percentage * 100}%` }]} />
        
        <View 
          style={[
            styles.thumb, 
            { 
              backgroundColor: color, 
              borderColor: theme.backgroundElement,
              shadowColor: color,
              left: `${percentage * 100}%` 
            }
          ]} 
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.limitText, { color: theme.textSecondary }]}>{min}</Text>
        <Text style={[styles.limitText, { color: theme.textSecondary }]}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.4)', // theme.cardBackground approx
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  trackContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 10,
  },
  trackBackground: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    position: 'absolute',
  },
  trackFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    position: 'absolute',
    transform: [{ translateX: -10 }], // center the thumb exactly on its percentage
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  limitText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
