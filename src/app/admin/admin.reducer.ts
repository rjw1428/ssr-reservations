import { createReducer, on } from "@ngrx/store"
import { AdminState } from "../models/admin-state"
import { AdminActions } from "./admin.action-types"

export const initialState: AdminState = {
    summary: null,
    users: null,
    userReservations: null,
    submittedApplications: null,
    submittedApplicationFilter: 'pending',
    transactions: null
}

export const adminReducer = createReducer(
    initialState,
    on(AdminActions.logout, (state) => initialState),
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
    )),
    on(AdminActions.storeSubmittedApplications, (state, action) => (
        {
            ...state,
            submittedApplications: action.applications
                .map(app => ({ [app.id]: app }))
                .reduce((acc, cur) => ({ ...acc, ...cur }), {})
        })
    ),
    on(AdminActions.updatedSubmittedApplicationFilter, (state, action) => ({ ...state, submittedApplicationFilter: action.filter })),
    on(AdminActions.storeTransactions, (state, { transactions }) => (
        {
            ...state,
            transactions: transactions.reduce((acc, cur) => {
                return { ...acc, [cur.id]: cur }
            }, {})
        })
    )
)