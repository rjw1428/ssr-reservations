import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ShoppingState } from "../models/shopping-state";
import { UserAccountState } from "../models/user-account-state";

export const selectUserAccountState = createFeatureSelector<UserAccountState>("userAccount")

export const userCurrentReservationsSelector = createSelector(
    selectUserAccountState,
    userAccount => {
        const now = new Date().getTime()
        return userAccount.reservations
            ? Object.keys(userAccount.reservations)
                .map(key => ({ ...userAccount.reservations[key], id: key }))
                .filter(reservation => reservation.endTime >= now)
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
                .filter(reservation => reservation.endTime < now)
            : []
    }
)

export const expandedProductSelector = createSelector(
    selectUserAccountState,
    (userAccount, id) => {
        return userAccount.expandedReservationSpaceDetails
            ? userAccount.expandedReservationSpaceDetails[id]
            : null
    }
)