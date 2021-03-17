import { createAction, props } from "@ngrx/store";
import { AdminSummary } from "../models/admin-summary";
import { Product } from "../models/product";


export const getPoductList = createAction(
    "[Product Type Component] Fetch products"
)

export const storePoductList = createAction(
    "[Product Type Effect] Store fetched products to state",
    props<{ products: { [id: string]: Product } }>()
)

export const removeProductType = createAction(
    "[Product Tile Component] Delete Self",
    props<{ id: string }>()
)

export const saveProduct = createAction(
    "[Add Product Type Component] New Product Type Saved",
    props<{ product: Product }>()
)

export const editProduct = createAction(
    "[Add Product Type Component] Product Type Edited",
    props<{ updatedProduct: Product }>()
)

export const saveProductComplete = createAction(
    "[Add Product Type Component] Save confirmed",
)

export const getAdminSummary = createAction(
    '[Summary Component] Fetch admin summary'
)

export const storeAdminSummary = createAction(
    '[Summary Component] Store admin summary',
    props<{ summary: AdminSummary }>()
)
