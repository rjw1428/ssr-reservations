import { createFeatureSelector, createSelector } from "@ngrx/store";
import { UserAccountState } from "../models/user-account-state";

export const selectUserAccountState = createFeatureSelector<UserAccountState>("userAccount")

export const userCurrentReservationsSelector = createSelector(
    selectUserAccountState,
    userAccount => {
        const now = new Date().getTime()
        return userAccount.reservations
            ? Object.keys(userAccount.reservations)
                .map(key => ({ ...userAccount.reservations[key], id: key }))
                .filter(reservation => reservation.endDate >= now)
            : []
    }
)

export const userHistoricReservationsSelector = createSelector(
    selectUserAccountState,
    userAccount => {
        const now = new Date().getTime()
        return userAccount.reservations
            ? Object.keys(userAccount.reservations)
                .map(key => ({ ...userAccount.reservations[key], id: key }))
                .filter(reservation => reservation.endDate < now)
            : []
    }
)

export const userPendingApplicationsSelector = createSelector(
    selectUserAccountState,
    userAccount => userAccount.pendingApplications
        ? Object.values(userAccount.pendingApplications)
        : []

)

export const userRejectedApplicationsSelector = createSelector(
    selectUserAccountState,
    userAccount => userAccount.rejectedApplications
        ? Object.values(userAccount.rejectedApplications)
        : []

)