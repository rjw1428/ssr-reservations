import { state } from "@angular/animations";
import { createReducer, on } from "@ngrx/store";
import { AppActions } from "./app.action-types";
import { AppState } from "./models/app-state";

export const initialAppState: AppState = {
    isLoading: false,
    loginFeedback: null,
    user: null,
    storedProducts: null,
    newUserCreationBroadcast: false,
    storedSpaces: null,
    allSpacesStored: false
}

const _appReducer = createReducer(
    initialAppState,
    on(AppActions.startLoading, (state) => {
        console.log("START")
        return { ...state, isLoading: true }
    }),
    on(AppActions.stopLoading, (state) => {
        console.log("STOP")
        return { ...state, isLoading: false }
    }),
    on(AppActions.setLoginFeedback, (state, { success, message }) => ({ ...state, loginFeedback: { success, error: message }, isLoading: false, newUserCreationBroadcast: false })),
    on(AppActions.loginSuccess, (state, action) => ({ ...state, user: action.user })),
    on(AppActions.logOut, (state) => ({ ...state, user: initialAppState.user })),
    on(AppActions.storeProductsList, (state, action) => {
        return {
            ...state,
            storedProducts: action.products
        }
    }),
    on(AppActions.storedSpaceDetails, (state, { space }) => ({ ...state, storedSpaces: { ...state.storedSpaces, ...space } })),
    on(AppActions.storeAllSpaceDetails, (state, { spaces }) => ({ ...state, storedSpaces: spaces, allSpacesStored: true })),
    on(AppActions.broadcastNewUserCreation, (state, action) => ({ ...state, newUserCreationBroadcast: action.shouldBroadcast }))
)

export function appReducer(state, action) {
    return _appReducer(state, action);
}