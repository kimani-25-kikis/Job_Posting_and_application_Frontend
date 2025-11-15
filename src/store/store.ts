import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { jobsApi } from './api/jobsApi';
import { applicationsApi } from './api/applicationsApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(jobsApi.middleware)
      .concat(applicationsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;