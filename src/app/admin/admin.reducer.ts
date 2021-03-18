import { createReducer, on } from "@ngrx/store"
import { AdminState } from "../models/admin-state"
import { AdminActions } from "./admin.action-types"

export const initialState: AdminState = {
    isSaving: false,
    summary: null,
    users: null,
    userReservations: null
}

export const adminReducer = createReducer(
    initialState,
    on(AdminActions.saveProduct, (state) => ({ ...state, isSaving: true })),
    on(AdminActions.editProduct, (state) => ({ ...state, isSaving: true })),
    on(AdminActions.saveProductComplete, (state) => ({ ...state, isSaving: false })),
    on(AdminActions.storeAdminSummary, (state, action) => ({ ...state, summary: action.summary })),
    on(AdminActions.storeUserList, (state, action) => ({ ...state, users: action.users })),
    on(AdminActions.storeUserReservation, (state, action) => (
        {
            ...state,
            userReservations: {
                ...state.userReservations,
                ...action.reservations
            }
        }
    ))
)