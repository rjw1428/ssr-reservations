export interface ProductSummary {
    [spaceId: string]: {
        productId: string,
        reserved: {
            [startTime: string]: {
                reservation: string,
                user: string
            }
        },
    },
}