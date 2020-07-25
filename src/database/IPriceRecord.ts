export interface IPrice {
    value: string;
    currency: string;
};

export interface IPriceRecord {
    id: number;
    price: IPrice;
    metaData: any;
}
