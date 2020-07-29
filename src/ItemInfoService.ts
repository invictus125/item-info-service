import { IServiceConfig } from './IServiceConfig';
import RedSkyClient from './client/RedSkyClient';
import Database from './database/Database';
import RESTServer from './rest/RESTServer';
import { IProductRecord } from './IProductRecord';
import { IPriceRecord } from './database/IPriceRecord';
import ItemInfoCache from './cache/ItemInfoCache';
import _ from 'lodash';

class ItemInfoService {
  private configuration: IServiceConfig;
  private redSkyClient: RedSkyClient;
  private database: Database;
  private restServer: RESTServer;
  private cache: ItemInfoCache;
  private debug = false;

  /**
   * Starts the service and all associated subsystems.
   * @param config - A configuration to use during this run of the system
   * @param debug - True if debug console output is desired, else false
   */
  public start(config: IServiceConfig, debug = false): void {
    this.configuration = _.cloneDeep(config);
    this.debug = debug;

    if (debug) {
      console.log(`Using config: ${JSON.stringify(this.configuration)}`);
    }

    this.database = new Database(this.configuration.database);
    this.redSkyClient = new RedSkyClient(this.configuration.redSky);

    // Set up callback for syncing items in the cache, and then create the cache.
    this.configuration.cache.itemSyncCallback = this.getRecordFromExternalSources.bind(this);
    this.cache = new ItemInfoCache(this.configuration.cache);

    // Set up paths for the rest server.
    if (this.configuration.restServer.paths === undefined) {
      this.configuration.restServer.paths = [];
    }
    this.configuration.restServer.paths.push({
      path: '/products/:id',
      getCallback: this.handleItemInfoRequest.bind(this),
      putCallback: this.handleItemPricePut.bind(this)
    });

    // Start the rest server.
    this.restServer = new RESTServer();
    this.restServer.start(this.configuration.restServer);
  }

  /**
   * Retrieves product information from RedSky and the prices store, and returns it in the form of a product record.
   * @param id - The product ID to get info for
   */
  private async getRecordFromExternalSources(id: number): Promise<IProductRecord> {
    // When in debug mode, collect time measurements of how long ops take
    let startTime;
    if (this.debug) {
      startTime = process.hrtime.bigint();
    }

    // Retrieve information from the redsky API and the prices store.
    const redSkyData = await this.redSkyClient.getItemData(id);
    let priceData: Array<IPriceRecord> = await this.database.PricesStore.read('id', id);

    // Handle the case where there's no price data in our store yet.
    // This block of code is not necessary if we start with a fully-populated
    // database, but this was the only way to do it when not given price data
    // to begin with.
    if (!priceData || priceData.length === 0) {
      const record: IPriceRecord = {
        id,
        price: {
          value: redSkyData.price,
          currency: 'USD'
        },
        metaData: {
          added: 'auto added w/ redsky price'
        }
      };
      this.database.PricesStore.create(record);
      priceData = [ record ];
    }

    // Give insight into what happened and how long it took
    if (this.debug) {
      const endTime = process.hrtime.bigint();
      console.log(
        `Retrieved item information from external sources in ${endTime - startTime} nanoseconds`
      );
    }

    // Compose the return data.
    return {
      id,
      name: redSkyData.name,
      current_price: {
        value: priceData[0].price.value,
        currency_code: priceData[0].price.currency
      }
    };
  }

  /**
   * Retrieves information from the cache if possible, and returns it.
   * If the desired information is not in the cache, retrieves it from RedSky and the prices store.
   * @param id - The product ID retrieve information for
   */
  private async handleItemInfoRequest(id: number): Promise<IProductRecord> {
    let startTime;
    if (this.debug) {
      startTime = process.hrtime.bigint();
    }

    // Retrieve cache data if possible
    let data: IProductRecord = this.cache.get(id);

    let cacheEndTime;
    if (this.debug) {
      cacheEndTime = process.hrtime.bigint();
    }

    // Data doesn't exist in the cache, so add it from the external sources
    if (!data) {
      data = await this.getRecordFromExternalSources(id);

      if (this.debug) {
        console.log(`Writing to cache: ${JSON.stringify(data)}`);
      }

      this.cache.write(data);
    } else if (this.debug) {
      // Figure out how long it took to get data from the cache.
      console.log(
        `Record retrieved from cache in ${cacheEndTime - startTime} nanoseconds`
      );
    }

    return data;
  }

  /**
   * Handles a PUT request containing new price information for an item, writing the new value to both the cache and the prices store.
   * @param id - The ID of the record for which to change the price
   * @param record - The product record from the body of the PUT request
   */
  private async handleItemPricePut(id: number, record: IProductRecord): Promise<any> {
    await this.database.PricesStore.update({
      id,
      price: {
        value: record.current_price.value,
        currency: record.current_price.currency_code
      },
      metaData: { updated: 'PUT' }
    });

    // Write the change through to the cache.
    const cacheRec = this.cache.get(id);
    if (cacheRec) {
      cacheRec.current_price = record.current_price;
      this.cache.write(cacheRec);
    }

    return record;
  }
}

const service = new ItemInfoService();

export default service;
