import { createAction, props } from "@ngrx/store";
import { Product } from "./models/product";
import { Reservation } from "./models/reservation";
import { User } from "./models/user";

export const startLoading = createAction(
    "[App Component] Start Loading Screen"
)
export const stopLoading = createAction(
    "[App Component] Clear Loading Screen"
)

export const login = createAction(
    '[Layout Component] Login',
    props<{ username: string, password: string }>()
)

export const checkUserPersistance = createAction(
    '[App Component] Check for persistant sser',
)

export const getUserAccount = createAction(
    '[App Effect] Get User Account Info',
    props<{ uid: string }>()
)

export const loginSuccess = createAction(
    '[App Effect] Login response success',
    props<{ user: User }>()
)

export const logOut = createAction(
    '[Layout Component] Logout'
)

export const createUser = createAction(
    '[New User Component] New User Submitted',
    props<{ user: User }>()
)

export const newUserCreated = createAction(
    '[App Effect] User Created & Stored'
)

export const resetPassword = createAction(
    '[Forgot Password Component] User Requests Password Reset',
    props<{ email: string }>()
)

export const noAction = createAction(
    '[App Effect] SKIP ACTION'
)

export const getProductTypes = createAction(
    "[Reservation List Component] Fetch products"
)

export const storeProductsList = createAction(
    "[Any Effect] Store All Products",
    props<{ products: { [productId: string]: Product } }>()
)

export const fetchSpaceDetails = createAction(
    "[Reservation Component] Fetch Selected Reservation Space Details",
    props<{ reservation: Reservation }>()
)

export const storedSpaceDetails = createAction(
    "[Any Effect] Store Expanded Reservation Info",
    props<{ spaceName: string, reservationId: string, product: Product }>()
)
