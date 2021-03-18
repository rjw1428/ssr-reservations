import { AdminSummary } from "./admin-summary";
import { Product } from "./product";
import { Reservation } from "./reservation";
import { User } from "./user";

export interface AdminState {
    isSaving: boolean
    summary: AdminSummary
    users: { [id: string]: User }
    userReservations: {
        [userId: string]: {
            [reservationId: string]: Reservation
        }
    }
}
