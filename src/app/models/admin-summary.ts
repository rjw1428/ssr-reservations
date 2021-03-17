import { Product } from "./product";
import { ProductSummary } from "./product-summary";

export interface AdminSummary {
    [productId: string]: ProductSummary,
}