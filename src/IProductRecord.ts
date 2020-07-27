export interface IProductRecord {
  id: number;
  name: string;
  current_price: {
    value: number;
    currency_code: string;
  };
}
