export interface Transaction {
    id?: string;
    userId: string;
    spaceName: string;
    productName: string;
    reservationId: string;
    dateCreated: number;
    dateDue: number;
    amount: number
}
