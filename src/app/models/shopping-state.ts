import { Product } from "./product";

export interface ShoppingState {
    products: { [id: string]: Product }
    reservationSubmissionMode: string
    isSaving: boolean
}
