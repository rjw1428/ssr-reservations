import { createAction, props } from "@ngrx/store";
import { Product } from "../models/product";
import { Reservation } from "../models/reservation";

export const logout = createAction(
    "[App Effect] Logout - Clear user data"
)

export const getReservations = createAction(
    "[Current Reservations Component] Fetch Current Reservations",
    // props<{ userId: string }>()
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
    props<{ token: string }>()
)

export const creditCardAddResponse = createAction(
    "[User Effect] Credit Card saved response",
    props<{ response: any }>()
)

export const startLoading = createAction(
    "[Any User Component] Data is being sent to stripe"
)

export const sendCharge = createAction(
    "[Payment Form Component] Send Stripe Charge",
    props<{ amount: number, sourceId: string, reservationId: string, selectedTime: number, spaceId: string, productId: string }>()
)
