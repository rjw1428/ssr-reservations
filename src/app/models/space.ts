export interface Space {
    id?: string;
    name: string;
    productId: string;
    reserved: number[]
    reservedHours?: [];
    reservedDays?: [];
}
