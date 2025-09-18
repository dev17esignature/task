import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/**
 * Typed hook for dispatching actions throughout the app
 * Use this instead of plain `useDispatch` for better TypeScript support
 * @returns Typed dispatch function
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed hook for selecting state throughout the app  
 * Use this instead of plain `useSelector` for better TypeScript support
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;