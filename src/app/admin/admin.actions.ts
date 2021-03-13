import { createAction, props } from "@ngrx/store";
import { Product } from "../models/product";

export const saveProduct = createAction(
    "[Add Product Type Component] New Product Type Saved",
    props<{ product: Product }>()
)