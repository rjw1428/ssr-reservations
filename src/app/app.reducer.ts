import { createReducer, on } from "@ngrx/store";
import { AppActions } from "./app.action-types";
import { AppState } from "./models/app-state";

export const initialAppState: AppState = {
    isLoading: false,
    isLoggingIn: false,
    user: null,
    storedProducts: null,
    storedSpaceDetails: null
}

const _appReducer = createReducer(
    initialAppState,
    on(AppActions.startLoading, (state) => ({ ...state, isLoading: true })),
    on(AppActions.stopLoading, (state) => ({ ...state, isLoading: false })),
    on(AppActions.login, (state) => ({ ...state, isLoggingIn: true })),
    on(AppActions.loginSuccess, (state, action) => ({ ...state, isLoggingIn: false, user: action.user })),
    on(AppActions.logOut, (state) => ({ ...state, user: initialAppState.user })),
    on(AppActions.storeProductsList, (state, action) => {
        return {
            ...state,
            storedProducts: action.products
        }
    }),
    on(AppActions.storedSpaceDetails, (state, action) => {
        const newDetail = {
            [action.reservationId]: {
                spaceName: action.spaceName
            }
        }
        return {
            ...state,
            storedSpaceDetails: { ...state.storedSpaceDetails, ...newDetail }
        }
    }),
)

export function appReducer(state, action) {
    return _appReducer(state, action);
}