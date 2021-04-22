import { AdminSummary } from "./admin-summary";
import { Reservation } from "./reservation";
import { Transaction } from "./transaction";
import { User } from "./user";

export interface AdminState {
    summary: AdminSummary
    users: { [id: string]: User }
    userReservations: {
        [userId: string]: {
            [reservationId: string]: Reservation
        }
    }
    transactions: { [id: string]: Transaction }
    submittedApplications: { [id: string]: Reservation },
    submittedApplicationFilter: string
}
