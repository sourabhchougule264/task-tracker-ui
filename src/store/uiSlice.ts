import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState, NotificationState } from '../types';

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  notification: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    showNotification: (state, action: PayloadAction<Omit<NotificationState, 'open'>>) => {
      state.notification = {
        ...action.payload,
        open: true,
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;

