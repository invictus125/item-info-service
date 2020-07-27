export interface IPrice {
    value: number;
    currency: string;
}

export interface IPriceRecord {
    id: number;
    price: IPrice;
    metaData: any;
}
