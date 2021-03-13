import { createReducer, on } from "@ngrx/store"
import { AdminState } from "../models/admin-state"
import { AdminActions } from "./admin.action-types"

export const initialState: AdminState = {}

export const adminReducer = createReducer(
    initialState,
    on(AdminActions.saveProduct, (state, product) => (state))
)