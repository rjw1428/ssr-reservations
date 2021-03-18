import { createAction, props } from "@ngrx/store";
import { Product } from "../models/product";
import { Reservation } from "../models/reservation";


export const getReservations = createAction(
    "[Current Reservations Component] Fetch Current Reservations",
    // props<{ userId: string }>()
)

export const storeReservations = createAction(
    "[User Effect] Store Current Reservations",
    props<{ reservations: Reservation[] }>()
)

export const fetchReservationSpaceDetails = createAction(
    "[Reservation Component] Fetch Selected Reservation Space Details",
    props<{ reservation: Reservation }>()
)

export const deleteReservation = createAction(
    "[Reservation Component] Delete Reservation",
    props<{ reservation: Reservation }>()
)

export const storeReservationDetails = createAction(
    "[User Effect] Store Expanded Reservation Info",
    props<{ spaceName: string, reservationId: string, product: Product }>()
)