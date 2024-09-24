// src/app/hooks.ts

import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./store";

/**
 * Custom hook to provide the typed dispatch function.
 *
 * Use `useAppDispatch` throughout your application instead of the plain `useDispatch`.
 * This ensures that all dispatch calls are properly typed with `AppDispatch`.
 *
 * Example usage:
 * const dispatch = useAppDispatch();
 * dispatch(yourAction());
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Custom hook to provide the typed selector function.
 *
 * Use `useAppSelector` throughout your application instead of the plain `useSelector`.
 * This ensures that all state selections are properly typed with `RootState`.
 *
 * Example usage:
 * const yourState = useAppSelector(state => state.yourSlice);
 */
export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * Custom hook to provide the typed store.
 *
 * Use `useAppStore` throughout your application instead of the plain `useStore`.
 * This ensures that interactions with the store are properly typed with `AppStore`.
 *
 * Example usage:
 * const store = useAppStore();
 * const state = store.getState();
 */
export const useAppStore = useStore.withTypes<AppStore>();
