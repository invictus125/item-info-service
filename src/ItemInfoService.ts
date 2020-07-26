import { IServiceConfig } from './IServiceConfig';
import RedSkyClient from './client/RedSkyClient';
import Database from './database/Database';
import RESTServer from './rest/RESTServer';
import _ from 'lodash';

class ItemInfoService {
  private configuration: IServiceConfig;
  private redSkyClient: RedSkyClient;
  private database: Database;
  private restServer: RESTServer;

  public start(config: IServiceConfig): void {
    this.configuration = _.cloneDeep(config);
    this.database = new Database(this.configuration.database);
    this.redSkyClient = new RedSkyClient(this.configuration.redSky);
    
    // Set up paths for the rest server.
    if (this.configuration.restServer.paths === undefined) {
      this.configuration.restServer.paths = [];
    }
    this.configuration.restServer.paths.push({
      path: '/product/{id}',
      getCallback: this.handleItemInfoRequest.bind(this),
      putCallback: this.handleItemPricePut.bind(this)
    });

    // Start the rest server.
    this.restServer = new RESTServer();
    this.restServer.start(this.configuration.restServer);
  }

  private handleItemInfoRequest(): void {
    // TODO: Process the information request
    throw new Error('not implemented!');
  }

  private handleItemPricePut(): void {
    // TODO: Process the price change
    throw new Error('not implemented!');
  }
}

const service = new ItemInfoService();

export default service;
