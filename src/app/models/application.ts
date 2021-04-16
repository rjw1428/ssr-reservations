import { User } from "./user";

export interface Application {
    id?: string
    companyName: string,
    companyDescription: string,
    dateCreated: number,
    status: string,
    userId: string,
    user?: User
    feedback?: string
}
