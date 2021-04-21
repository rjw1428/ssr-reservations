import { Product } from "./product";
import { Space } from "./space";
import { User } from "./user";

export interface AppState {
    isLoading: boolean,
    loginFeedback: { error: string, success: boolean }
    user: User
    storedProducts: { [spaceId: string]: Product }
    // storedSpaceDetails: {
    //     [reservationId: string]: {
    //         spaceName: string
    //     }
    // }
    storedSpaces: { [spaceId: string]: Space }
}
