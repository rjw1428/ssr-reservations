import { createReducer, on } from "@ngrx/store"
import { UserAccountState } from "../models/user-account-state"
import { UserAccountActions } from "./user.action-types"

export const initialState: UserAccountState = {
    reservations: null,
    details: null
}

export const userAccountReducer = createReducer(
    initialState,
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
    on(UserAccountActions.storeReservationDetails, (state, action) => {
        const newDetail = {
            [action.reservationId]: {
                spaceName: action.spaceName
            }
        }
        return {
            ...state,
            details: { ...state.details, ...newDetail }
        }
    })
)

