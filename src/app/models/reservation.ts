export interface Reservation {
    id?: string;
    userId: string;
    spaceId: string;
    startTime: number;          //epoch
    endTime: number             //epoch
    createdTime: number;        //epoch
    lastModifiedTime: number;   //epoch
    cost: number
}
