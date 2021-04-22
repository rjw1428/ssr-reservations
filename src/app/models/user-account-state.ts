import { Reservation } from "./reservation";
import { Transaction } from "./transaction";

export interface UserAccountState {
    reservations: { [id: string]: Reservation }
    pendingApplications: { [id: string]: Reservation }
    rejectedApplications: { [id: string]: Reservation }
    transactions: { [id: string]: Transaction }
    creditCardResp: { resp: any, error: any }
    paymentResponse: { resp: any, error: any }
    formFeeback: { success: any, message: any }
}
