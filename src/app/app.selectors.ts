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

export const cachedProductSelector = createSelector(
    selectAppState,
    (app, id) => {
        return app.storedProducts
            ? app.storedProducts[id]
            : null
    }
)

export const cachedProductListSelector = createSelector(
    selectAppState,
    app => {
        return app.storedProducts
            ? Object.values(app.storedProducts)
            : []
    }
)