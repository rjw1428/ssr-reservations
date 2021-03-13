import { createReducer, on } from "@ngrx/store";
import { AppActions } from "./app.action-types";

export const initialAppState = {
    isLoading: false
}

const _appReducer = createReducer(
    initialAppState,
    on(AppActions.startLoading, (state) => ({ ...state, isLoading: true })),
    on(AppActions.stopLoading, (state) => ({ ...state, isLoading: false }))
)

export function appReducer(state, action) {
    return _appReducer(state, action);
}