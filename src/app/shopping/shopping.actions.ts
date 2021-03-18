import { createAction, props } from "@ngrx/store";
import { Product } from "../models/product";
import { Reservation } from "../models/reservation";
import { Space } from "../models/space";


export const getPoductList = createAction(
    "[Shopping Component] Fetch products"
)

export const setReservationMode = createAction(
    "[Add Reservation Component] Store Reservation Mode",
    props<{ mode: string }>()
)

export const saveReservation = createAction(
    "[Add Reservation Component] Save Reservation",
    props<{ reservation: Reservation, productId: string}>()
)

export const saveReservationComplete = createAction(
    "[Shopping Effect] Save Reservation"
)

export const queryAvailability = createAction(
    '[Reservation Component] Get Available Spaces',
    props<{ startTime: number, endTime: number, productId: string }>()
)

export const saveAvailableSpaces = createAction(
    '[Shopping Effect] Store filtered spaces',
    props<{ spaces: Space[] }>()
)
