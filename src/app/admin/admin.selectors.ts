import { createFeatureSelector, createSelector } from "@ngrx/store";
import { environment } from "src/environments/environment";
import { AdminState } from "../models/admin-state";

export const selectAdminState = createFeatureSelector<AdminState>("admin")

export const adminSummarySelector = createSelector(
    selectAdminState,
    admin => admin.summary
)

export const userListSelector = createSelector(
    selectAdminState,
    admin => admin.users
        ? Object.keys(admin.users)
            .map(key => ({ id: key, ...admin.users[key] }))
            .filter(user => environment.production
                ? user.role != 'master'
                : true)
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
                .filter(reservation => reservation.endDate > now)
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
                .filter(reservation => reservation.endDate <= now)
                .sort((a, b) => b.endDate - a.endDate)[0]
            : null
    }
)

export const submittedApplicationsSelector = createSelector(
    selectAdminState,
    admin => admin.submittedApplications
        ? Object.values(admin.submittedApplications)
        : []
)

export const applicationFilterSelector = createSelector(
    selectAdminState,
    admin => admin.submittedApplicationFilter
)
