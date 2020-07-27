export interface IRedSkyData {
  id: number;
  name: string;
  price?: number;
}

export interface IRedSkyResponse {
  product: {
    item: {
      product_description: {
        title: string;
      };
    };
    price: {
      listPrice: {
        price: number;
      };
    };
  };
}
