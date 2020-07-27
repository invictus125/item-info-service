import SecureWebRequestClient from './SecureWebRequestClient';
import { IRedSkyResponse, IRedSkyData } from './IRedSkyData';
import { IRedSkyConfig } from './IRedSkyConfig';

export default class RedSkyClient {
  private client: SecureWebRequestClient;
  private apiVersion: string;

  public constructor(config: IRedSkyConfig) {
    this.apiVersion = config.apiVersion;
    this.client = new SecureWebRequestClient('https://redsky.target.com');
  }

  public async getItemData(id: number): Promise<IRedSkyData> {
    const resp: any = await this.client.getJsonResponse([ `${this.apiVersion}/pdp/tcin/${id}` ]);
    return this.rsResponseToRsData(id, resp);
  }

  private rsResponseToRsData(id: number, resp: IRedSkyResponse): IRedSkyData {
    const data: IRedSkyData = {
      id,
      name: resp.product.item.product_description.title,
      price: resp.product.price.listPrice.price // Only use if we don't have a local one
    };
    return data;
  }
}
