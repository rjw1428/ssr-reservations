import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AppState } from "./models/app-state";

export const selectAppState = createFeatureSelector<AppState>("app")

export const loadingSelector = createSelector(
    selectAppState,
    app => app.isLoading
)

export const loginFeedbackSelector = createSelector(
    selectAppState,
    app => app.loginFeedback
)

export const userSelector = createSelector(
    selectAppState,
    app => app.user
)

export const isAdminSelector = createSelector(
    selectAppState,
    app => app.user && ['admin', 'master'].includes(app.user.role)
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
            : null
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

export const cachedSpaceSelector = createSelector(
    selectAppState,
    app => app.storedSpaces
)

export const reservationDetailsSelector = createSelector(
    selectAppState,
    (app: AppState, spaceId: string) => app.storedSpaces && app.storedSpaces[spaceId]
        ? app.storedSpaces[spaceId].name
        : null
)

export const paymentSourceSelector = createSelector(
    selectAppState,
    app => app.user && app.user.paymentSources
        ? Object.values(app.user.paymentSources)
        : []
)
