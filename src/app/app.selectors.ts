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

export const activeProductListSelector = createSelector(
    selectAppState,
    app => {
        return app.storedProducts
            ? Object.values(app.storedProducts)
                .filter(product => product.isActive)
                .sort((a, b) => a.name.localeCompare(b.name))
            : []
    }
)

export const deactiveProductIdsSelector = createSelector(
    selectAppState,
    app => {
        return app.storedProducts
            ? Object.values(app.storedProducts)
                .filter(product => !product.isActive)
                .map(product => product.id)
            : []
    }
)

export const cachedProductListSelector = createSelector(
    selectAppState,
    app => {
        return app.storedProducts
            ? Object.values(app.storedProducts)
                .sort((a, b) => a.name.localeCompare(b.name))
            : []
    }
)


export const reservationDetailsSelector = createSelector(
    selectAppState,
    (app: AppState, reservationId: string) => app.storedSpaceDetails && app.storedSpaceDetails[reservationId]
        ? app.storedSpaceDetails[reservationId].spaceName
        : null
)
