export interface Space {
    id?: string;
    name: string;
    productId: string;
    reserved: {
            [timestamp: number]: {
                reservation: string,    //reservationId
                user: string,           //userId
                hasPaid: boolean        //Updated 
            }
        }
}
