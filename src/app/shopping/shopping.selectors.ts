import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ShoppingState } from "../models/shopping-state";

export const selectShoppingState = createFeatureSelector<ShoppingState>("shopping")

export const productTypesSelector = createSelector(
    selectShoppingState,
    shopping => shopping.products
        ? Object.values(shopping.products)
        : []
)

export const reservationModeSelector = createSelector(
    selectShoppingState,
    shopping => shopping.reservationSubmissionMode
)

export const reservationSubmissionSuccessSelector = createSelector(
    selectShoppingState,
    shopping => shopping.isSaving
)