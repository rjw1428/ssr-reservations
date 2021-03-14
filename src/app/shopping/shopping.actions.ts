import { createAction, props } from "@ngrx/store";
import { Product } from "../models/product";
import { Reservation } from "../models/reservation";


export const getPoductList = createAction(
    "[Shopping Component] Fetch products"
)

export const storePoductList = createAction(
    "[Shopping Effect] Store fetched products to state",
    props<{ products: { [id: string]: Product } }>()
)

export const setReservationMode = createAction(
    "[Add Reservation Component] Store Reservation Mode",
    props<{ mode: string }>()
)

export const saveReservation = createAction(
    "[Add Reservation Component] Save Reservation",
    props<{ reservation: Reservation }>()
)

export const saveReservationComplete = createAction(
    "[Shopping Effect] Save Reservation"
)



