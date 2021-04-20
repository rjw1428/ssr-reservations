import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Reservation } from "../models/reservation";
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

export const userUnpaidReservationSelector = createSelector(
    selectUserAccountState,
    userAccount => {
        return userAccount.reservations
            ? Object.keys(userAccount.reservations)
                .map(key => ({ ...userAccount.reservations[key], id: key }))
                .filter(reservation => reservation.unpaidTimes)
                .reduce((acc, reservation) => {
                    return acc.concat(Object.keys(reservation.unpaidTimes)
                        .map(unpaidTime => {
                            return { ...reservation, unpaidTime }
                        })
                    )
                }, []) as Reservation[]
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

export const stripeDataProcessingSelector = createSelector(
    selectUserAccountState,
    userAccount => userAccount.isLoading
)
