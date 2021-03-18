import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AdminState } from "../models/admin-state";

export const selectAdminState = createFeatureSelector<AdminState>("admin")

export const productTypeSubmissionSuccessSelector = createSelector(
    selectAdminState,
    admin => admin.isSaving
)

export const adminSummarySelector = createSelector(
    selectAdminState,
    admin => admin.summary
)

export const userListSelector = createSelector(
    selectAdminState,
    admin => admin.users
        ? Object.keys(admin.users)
            .map(key => ({ id: key, ...admin.users[key] }))
        : []
)

export const userSelector = createSelector(
    selectAdminState,
    (admin, userId) => admin.users
        ? admin.users[userId]
        : null
)

export const userReservationsSelector = createSelector(
    selectAdminState,
    (admin: AdminState, userId: string) => admin.userReservations && admin.userReservations[userId]
        ? Object.keys(admin.userReservations[userId])
            .map(key => ({ id: key, ...admin.userReservations[userId][key] }))
        : []
)

export const userNextReservationsSelector = createSelector(
    selectAdminState,
    (admin: AdminState, userId: string) => {
        const now = new Date().getTime()
        return admin.userReservations && admin.userReservations[userId]
            ? Object.keys(admin.userReservations[userId])
                .map(key => ({ id: key, ...admin.userReservations[userId][key] }))
                .filter(reservation => reservation.endTime > now)
            : []
    }
)

export const userPreviousReservationsSelector = createSelector(
    selectAdminState,
    (admin: AdminState, userId: string) => {
        const now = new Date().getTime()
        return admin.userReservations && admin.userReservations[userId]
            ? Object.keys(admin.userReservations[userId])
                .map(key => ({ id: key, ...admin.userReservations[userId][key] }))
                .filter(reservation => reservation.endTime <= now)
                .sort((a, b) => b.endTime - a.endTime)[0]
            : null
    }
)