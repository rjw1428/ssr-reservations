import { RouterReducerState } from "@ngrx/router-store";
import { AdminState } from "./admin-state";
import { Product } from "./product";
import { User } from "./user";

export interface AppState {
    // router: RouterReducerState;
    isLoading: boolean,
    isLoggingIn: boolean,
    user: User
    storedProducts: { [spaceId: string]: Product }
}
