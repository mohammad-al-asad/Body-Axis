import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

interface SettingsState {
  theme: 'light' | 'dark';
  firstTime: boolean;
}

const initialState: SettingsState = {
  theme: Appearance.getColorScheme() === 'light' ? 'light' : 'dark',
  firstTime: true,
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
    completeOnboarding: (state) => {
      state.firstTime = false;
    },
  },
});

export const { setTheme, toggleTheme, completeOnboarding } = settingsSlice.actions;
export default settingsSlice.reducer;
