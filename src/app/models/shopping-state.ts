import { Product } from "./product";
import { Space } from "./space";

export interface ShoppingState {
    reservationSubmissionMode: string
    isSaving: boolean,
    availableSpaces: Space[]
}
