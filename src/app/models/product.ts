export interface Product {
    id?: string;
    name: string;
    description: string;
    dateCreated: Date
    count: number;
    month: number;
    isActive: boolean;
    leaseOptions: string[];     // constants.LEASETYPES
    img: string
}
