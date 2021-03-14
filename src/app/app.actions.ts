import { createAction, props } from "@ngrx/store";
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

export const loginSuccess = createAction(
    '[App Effect] Login response success',
    props<{ uid: string }>()
)

export const createUser = createAction(
    '[New User Component] New User Submitted',
    props<{ user: User }>()
)

export const newUserCreated = createAction(
    '[App Effect] User Created & Stored'
)