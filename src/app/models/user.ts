export interface User {
    id?: string;             //uid from firebase
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'user' | 'master'
    dateCreated: number;     //epoch
    lastLogIn?: number;      //epoch
    ccId?: string;           //from stripe
    password?: string
}
