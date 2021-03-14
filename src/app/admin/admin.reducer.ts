import { createReducer, on } from "@ngrx/store"
import { AdminState } from "../models/admin-state"
import { AdminActions } from "./admin.action-types"

export const initialState: AdminState = {
    products: null,
    isSaving: false
}

export const adminReducer = createReducer(
    initialState,
    on(AdminActions.saveProduct, (state) => ({...state, isSaving: true})),
    on(AdminActions.editProduct, (state) => ({...state, isSaving: true})),
    on(AdminActions.saveProductComplete, (state) => ({...state, isSaving: false})),
    on(AdminActions.storePoductList, (state, action) => ({ ...state, products: action.products })),
)