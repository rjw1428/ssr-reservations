import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AdminState } from "../models/admin-state";

export const selectAdminState = createFeatureSelector<AdminState>("admin")

export const productTypesSelector = createSelector(
    selectAdminState,
    admin => admin.products
        ? Object.values(admin.products)
        : []
)

export const productTypeSubmissionSuccessSelector = createSelector(
    selectAdminState,
    admin => admin.isSaving
)

export const adminSummarySelector = createSelector(
    selectAdminState,
    admin => admin.summary
)