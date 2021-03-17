import { createReducer, on } from "@ngrx/store"
import { AdminState } from "../models/admin-state"
import { ShoppingState } from "../models/shopping-state"
import { ShoppingActions } from "./shopping.action-types"

export const initialState: ShoppingState = {
    reservationSubmissionMode: 'single',
    isSaving: false,
    availableSpaces: []
}

export const shoppingReducer = createReducer(
    initialState,
    // on(ShoppingActions.storePoductList, (state, action) => ({ ...state, products: action.products })),
    on(ShoppingActions.setReservationMode, (state, action) => ({ ...state, reservationSubmissionMode: action.mode })),
    on(ShoppingActions.saveReservation, (state, action) => ({ ...state, isSaving: true })),
    on(ShoppingActions.saveReservationComplete, (state, action) => ({ ...state, isSaving: false })),
    on(ShoppingActions.saveAvailableSpaces, (state, action)=> ({...state, availableSpaces: action.spaces}))
)