import { Reservation } from "./reservation";

export interface UserAccountState {
    reservations: { [id: string]: Reservation },
    pendingApplications: { [id: string]: Reservation }
    rejectedApplications: { [id: string]: Reservation }
}
