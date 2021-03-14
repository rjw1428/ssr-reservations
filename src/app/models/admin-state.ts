import { Product } from "./product";

export interface AdminState {
    products: { [id: string]: Product }
    isSaving: boolean
}
