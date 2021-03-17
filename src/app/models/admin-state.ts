import { AdminSummary } from "./admin-summary";
import { Product } from "./product";

export interface AdminState {
    products: { [id: string]: Product }
    isSaving: boolean,
    summary: AdminSummary
}
