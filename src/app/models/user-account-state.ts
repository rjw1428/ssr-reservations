import { Reservation } from "./reservation";

export interface UserAccountState {
    reservations: { [id: string]: Reservation }
    pendingApplications: { [id: string]: Reservation }
    rejectedApplications: { [id: string]: Reservation }
    creditCardResp: { resp: any, error: any }
    paymentResponse: { resp: any, error: any }
    formFeeback: { success: any, message: any }
}
