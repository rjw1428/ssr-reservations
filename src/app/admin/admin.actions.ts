import { createAction, props } from "@ngrx/store";
import { AdminSummary } from "../models/admin-summary";
import { Product } from "../models/product";
import { Reservation } from "../models/reservation";
import { User } from "../models/user";

export const logout = createAction(
    "[App Effect] Logout - Clear admin data"
)

export const getPoductList = createAction(
    "[Product Type Component] Fetch products"
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

export const getUserList = createAction(
    '[User List Component] Fetch User List'
)

export const storeUserList = createAction(
    '[Admin Effect] Store user list',
    props<{ users: { [id: string]: User } }>()
)

export const getUserReservation = createAction(
    '[User List Component] Fetch User Reservations',
    props<{ userId: string }>()
)

export const storeUserReservation = createAction(
    '[Admin Effect] Store user reservations',
    props<{ reservations: { [id: string]: { [reservationId: string]: Reservation } } }>()
)

export const openReservation = createAction(
    '[Admin Effect] Open Reservation Popup',
    props<{ spaceName: string, reservation: Reservation, product: Product }>()
)

export const getFullReservationDataFromList = createAction(
    '[User List Component] Fetch Reservation Data',
    props<{ reservation: Reservation }>()
)

export const getFullReservationDataFromSummary = createAction(
    '[Summary Component] Fetch Reservation Data',
    props<{ reservationId: string, productId: string, userId: string, spaceName: string }>()
)

export const demoteUser = createAction(
    '[User List Component] Demote Admin to User',
    props<{ userId: string }>()
)

export const promote = createAction(
    '[User List Component] Promote User to Admin',
    props<{ userId: string }>()
)

export const fetchSubmittedApplications = createAction(
    '[Application History Component] Fetch Applications',
    props<{ filter: string }>()
)

export const storeSubmittedApplications = createAction(
    '[Admin Effect] Store Pending Applications',
    props<{ applications: Reservation[] }>()
)

export const rejectApplicationFeedbackForm = createAction(
    '[Application History Component] Trigger Reject Application Form',
    props<{ application: Reservation }>()
)

export const rejectApplication = createAction(
    '[Admin Effect] Reject Application',
    props<{ application: Reservation }>()
)

export const acceptApplication = createAction(
    '[Application History Component] Accept Application',
    props<{ application: Reservation }>()
)

export const updatedSubmittedApplicationFilter = createAction(
    '[Application History Component] Update Applicatoin Filter',
    props<{ filter: string }>()
)