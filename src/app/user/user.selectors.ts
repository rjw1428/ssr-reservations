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
                    const lowestTime = Object.keys(reservation.unpaidTimes).reduce((min, time) => +time < min ? time : min, 9999999999000)
                    const unpaidReservations =  ({ ...reservation, unpaidTime: lowestTime } )
                    return acc.concat(unpaidReservations)
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

export const creditCardFeedbackSelector = createSelector(
    selectUserAccountState,
    userAccount => userAccount.creditCardResp
)

export const paymentFeedbackSelector = createSelector(
    selectUserAccountState,
    userAccount => userAccount.paymentResponse
)


