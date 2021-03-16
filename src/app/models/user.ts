export interface User {
    id?: string;             //uid from firebase
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'users'
    dateCreated: number;     //epoch
    lastLogIn?: number;      //epoch
    ccId?: string;           //from stripe
    password?: string
}
