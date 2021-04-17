import { createReducer, on } from "@ngrx/store"
import { UserAccountState } from "../models/user-account-state"
import { UserAccountActions } from "./user.action-types"

export const initialState: UserAccountState = {
    reservations: null,
    pendingApplications: null,
    rejectedApplications: null
}

export const userAccountReducer = createReducer(
    initialState,
    on(UserAccountActions.logout, (state) => initialState),
    on(UserAccountActions.getReservations, (state, action) => ({ ...state })),
    on(UserAccountActions.storeReservations, (state, action) => {
        const reservations = action.reservations
            ? action.reservations
                .map(res => ({ [res.id]: res }))
                .reduce((obj, res) => ({ ...obj, ...res }), {})
            : initialState.reservations
        return {
            ...state,
            reservations
        }
    }),
    on(UserAccountActions.storePendingApplications, (state, action) => {
        const pendingApplications = action.pendingApplications
            ? action.pendingApplications
                .map(res => ({ [res.id]: res }))
                .reduce((obj, res) => ({ ...obj, ...res }), {})
            : initialState.pendingApplications
        return {
            ...state,
            pendingApplications
        }
    }),
    on(UserAccountActions.storeRejectedApplications, (state, action) => {
        const rejectedApplications = action.rejectedApplications
            ? action.rejectedApplications
                .map(res => ({ [res.id]: res }))
                .reduce((obj, res) => ({ ...obj, ...res }), {})
            : initialState.rejectedApplications
        return {
            ...state,
            rejectedApplications
        }
    }),
)

