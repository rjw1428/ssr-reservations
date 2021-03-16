import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AppState } from "./models/app-state";

export const selectAppState = createFeatureSelector<AppState>("app")

export const loadingSelector = createSelector(
    selectAppState,
    app => app.isLoading
)

export const logginInSelector = createSelector(
    selectAppState,
    app => app.isLoggingIn
)

export const userSelector = createSelector(
    selectAppState,
    app => app.user
)
