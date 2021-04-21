import { User } from "./user";

export interface Reservation {
    id?: string;
    userId: string;
    spaceId: string;
    productId: string;
    startDate: number;          //epoch
    endDate: number             //epoch
    createdTime: number;        //epoch
    lastModifiedTime: number;   //epoch
    totalCost: number;
    cost: number;
    status: string;
    feedback?: string;
    user?: User;
    decisionDate?: number;
    isAlreadyBooked?: boolean;
    unpaidTimes?: { [time: string]: string };
}
