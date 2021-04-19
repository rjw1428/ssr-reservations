import { PaymentSource } from "./payment-source";

export interface User {
    id?: string;             //uid from firebase
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'user' | 'master'
    dateCreated: number;        //epoch
    lastLogIn?: number;         //epoch
    stripeCustomerId: string;   //from stripe
    password?: string
    paymentSources: PaymentSource[]
}
