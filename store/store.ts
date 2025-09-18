import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './patientSlice';

export const store = configureStore({
  reducer: {
    patients: patientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

/**
 * Root state type inferred from store
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * App dispatch type for TypeScript support
 */
export type AppDispatch = typeof store.dispatch;