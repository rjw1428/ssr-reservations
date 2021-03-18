import { Product } from "./product";
import { User } from "./user";

export interface AppState {
    isLoading: boolean,
    isLoggingIn: boolean,
    user: User
    storedProducts: { [spaceId: string]: Product }
}
