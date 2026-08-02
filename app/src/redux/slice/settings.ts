import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

interface SettingsState {
  theme: 'light' | 'dark';
  measurementUnit: 'metric' | 'imperial';
  firstTime: boolean;
  hasSeenIntroduction: boolean;
  localIsPremium: boolean;
}

const initialState: SettingsState = {
  theme: Appearance.getColorScheme() === 'light' ? 'light' : 'dark',
  measurementUnit: 'metric',
  firstTime: true,
  hasSeenIntroduction: false,
  localIsPremium: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setMeasurementUnit: (state, action: PayloadAction<'metric' | 'imperial'>) => {
      state.measurementUnit = action.payload;
    },
    completeOnboarding: (state) => {
      state.firstTime = false;
    },
    completeIntroduction: (state) => {
      state.hasSeenIntroduction = true;
    },
    setLocalIsPremium: (state, action: PayloadAction<boolean>) => {
      state.localIsPremium = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setMeasurementUnit,
  completeOnboarding,
  completeIntroduction,
  setLocalIsPremium,
} = settingsSlice.actions;
export default settingsSlice.reducer;
