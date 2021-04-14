import { Application } from "./application";
import { Product } from "./product";
import { Reservation } from "./reservation";

export interface UserAccountState {
    reservations: { [id: string]: Reservation },
    details: {
        [reservationId: string]: {
            spaceName: string
        }
    }
    pendingApplications: { [id: string]: Application }
}
