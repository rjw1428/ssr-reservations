import { createAction, props } from "@ngrx/store";
import { Product } from "./models/product";
import { Reservation } from "./models/reservation";
import { Space } from "./models/space";
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

export const setLoginFeedback = createAction(
    "[App Effect | Login Component] Set Login Feedback",
    props<{ success: boolean, message: string }>()
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

export const firebaseAuthCreated = createAction(
    '[App Effect] Firebase Auth Account Created',
    props<{ user: User }>()
)

export const userAccountWrittenToDb = createAction(
    '[App Effect] Account Stored to DB',
    props<{ user: User }>()
)

export const stripeAccountCreated = createAction(
    '[App Effect] Stripe Account Created',
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
    props<{ space: { [spaceId: string]: Space } }>()
)

export const fetchAllSpaceDetails = createAction(
    "[Payment Form] Fetch all space details",
)

export const storeAllSpaceDetails = createAction(
    "[App Effect] Store all space details",
    props<{ spaces: { [spaceId: string]: Space } }>()
)