export interface IPrice {
    value: string;
    prefix: string;
    currency: string;
};

export interface IPriceRecord {
    id: number;
    prices: Array<IPrice>;
    metaData: any;
}
