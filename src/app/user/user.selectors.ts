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
                .filter(reservation => reservation.endDate >= now && reservation.status != 'canceled')
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
                .filter(reservation => reservation.endDate < now || reservation.status == 'canceled')
            : []
    }
)

export const userUnpaidReservationSelector = createSelector(
    selectUserAccountState,
    userAccount => {
        return userAccount.reservations
            ? Object.keys(userAccount.reservations)
                .map(key => ({ ...userAccount.reservations[key], id: key }))
                .filter(reservation => reservation.unpaidTimes && reservation.status != 'canceled')
                .reduce((acc, reservation) => {
                    const lowestTime = Object.keys(reservation.unpaidTimes).reduce((min, time) => +time < min ? +time : min, 9999999999000)
                    const unpaidReservations = ({ ...reservation, unpaidTime: lowestTime })
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

export const formFeedbackSelector = createSelector(
    selectUserAccountState,
    userAccount => userAccount.formFeeback
)

export const userTransactionSelector = createSelector(
    selectUserAccountState,
    userAccount => userAccount.transactions
        ? Object.values(userAccount.transactions)
        : []
)

