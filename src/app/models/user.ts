import { PaymentSource } from "./payment-source";

export interface User {
    id?: string;             //uid from firebase
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    businessName: string
    address: string
    position: string
    size: number
    operatingHours: string
    sharedUserCount: number
    role: 'admin' | 'user' | 'master'
    dateCreated: number;        //epoch
    lastLogIn?: number;         //epoch
    stripeCustomerId: string;   //from stripe
    password?: string;
    paymentSources: { [sourceId: string]: PaymentSource };
    defaultPaymentSource: string
    revenue: number;
}
