import { createReducer, on } from "@ngrx/store";
import { AppActions } from "./app.action-types";
import { AppState } from "./models/app-state";

export const initialAppState: AppState = {
    isLoading: false,
    isLoggingIn: false,
    user: null
}

const _appReducer = createReducer(
    initialAppState,
    on(AppActions.startLoading, (state) => ({ ...state, isLoading: true })),
    on(AppActions.stopLoading, (state) => ({ ...state, isLoading: false })),
    on(AppActions.login, (state) => ({ ...state, isLoggingIn: true })),
    on(AppActions.loginSuccess, (state, action) => ({ ...state, isLoggingIn: false, user: action.user })),
    on(AppActions.logOut, (state)=>({...state, user: initialAppState.user}))
)

export function appReducer(state, action) {
    return _appReducer(state, action);
}