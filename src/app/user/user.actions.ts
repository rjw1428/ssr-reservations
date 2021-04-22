import { createAction, props } from "@ngrx/store";
import { Product } from "../models/product";
import { Reservation } from "../models/reservation";
import { Space } from "../models/space";
import { Transaction } from "../models/transaction";

export const logout = createAction(
    "[App Effect] Logout - Clear user data"
)

export const getReservations = createAction(
    "[Current Reservations Component] Fetch Current Reservations",
)

export const storeReservations = createAction(
    "[User Effect] Store Current Reservations",
    props<{ reservations: Reservation[] }>()
)

export const deleteReservation = createAction(
    "[Reservation Component] Delete Reservation",
    props<{ reservation: Reservation, status: string }>()
)

export const submitApplication = createAction(
    '[Application Component] New Applicatoin Submitted',
    props<{ application: Reservation }>()
)

export const fetchPendingApplications = createAction(
    "[Application Status Component] Fetch User Pending Applications"
)

export const storePendingApplications = createAction(
    "[User Effect] Store User Pending Applications",
    props<{ pendingApplications: Reservation[] }>()
)

export const fetchRejectedApplications = createAction(
    "[Application Status Component] Fetch User Rejected Applications"
)

export const storeRejectedApplications = createAction(
    "[User Effect] Store User Rejected Applications",
    props<{ rejectedApplications: Reservation[] }>()
)

export const addCreditCardToStripe = createAction(
    "[Add Payment Method] Store payment source",
    props<{ token: string, isDefault: boolean }>()
)

export const sendCharge = createAction(
    "[Payment Form Component] Send Stripe Charge",
    props<{ amount: number, sourceId: string, reservationId: string, selectedTime: number, space: Space }>()
)

export const creditCardSaved = createAction(
    "[User Effect] Credit Card response",
    props<{ resp: any, error: any }>()
)

export const paymentSaved = createAction(
    "[User Effect] Payment response",
    props<{ resp: any, error: any }>()
)

export const resetCreditCardFeedback = createAction(
    "[Add Payment Method Component] (On Close) Reset credit card feedback",
)

export const resetPaymetFeedback = createAction(
    "[Payment Form Component] (On Destroy) Reset payment feedback",
)

export const updateUserData = createAction(
    "[User Data Component | Account Info Component] Update user data",
    props<{ userData: any }>()
)

export const setFormFeedback = createAction(
    "[User Effect] Set Feedback",
    props<{ success: boolean, message: string }>()
)

export const fetchLatestUserData = createAction(
    "[User Effect] Fetch Latest User Data"
)

export const setDefaultPaymentSource = createAction(
    '[Account Info Component | Add payment Source Component] Set Default Payment Source',
    props<{ defaultPaymentSource: string }>()
)

export const fetchUserTransactions = createAction(
    '[Transaction History Component] Fetch User Transactions',
)

export const storeUserTransactions = createAction(
    '[User Effect] Store User Transactions',
    props<{ transactions: Transaction[] }>()
)