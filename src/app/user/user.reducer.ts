import { createReducer, on } from "@ngrx/store"
import { AdminState } from "../models/admin-state"
import { ShoppingState } from "../models/shopping-state"
import { UserAccountState } from "../models/user-account-state"
import { UserAccountActions } from "./user.action-types"

export const initialState: UserAccountState = {
    reservations: null,
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
)

