import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

interface SettingsState {
  theme: 'light' | 'dark';
}

const initialState: SettingsState = {
  theme: Appearance.getColorScheme() === 'light' ? 'light' : 'dark',
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
  },
});

export const { setTheme, toggleTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
