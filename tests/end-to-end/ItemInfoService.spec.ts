import ItemInfoService from '../../src/ItemInfoService';
import { generateDefaultConfiguration, IServiceConfig } from '../../src/IServiceConfig';
import { IProductRecord } from '../../src/IProductRecord';
import path from 'path';
import axios from 'axios';
import fs from 'fs';

const testProductIds = [ 13860428, 54456119, 13264003, 12954218 ];

const testConfig: IServiceConfig = generateDefaultConfiguration();
testConfig.database.path = path.resolve(process.cwd(), 'tests', 'end-to-end');
testConfig.database.prices.dataFile = 'testDB.nosql';
const dbFile = path.resolve(process.cwd(), 'tests','end-to-end','testDB.nosql');

describe('ItemInfoService', (): void => {

  afterAll((): void => {
    fs.truncate(dbFile, 0, () => {
      // Not empty
    });
  });

  describe('start', (): void => {
    it('sets up the database, cache, redsky client, and REST server', (): void => {
      ItemInfoService.start(testConfig);
      // @ts-ignore
      const restPaths = ItemInfoService.configuration.restServer.paths;
      expect(restPaths.length).toBe(1);
      expect(restPaths[0].path).toBe('/products/:id');
    });
  });

  describe('handleItemPricePut', (): void => {
    it('puts a price into the store for a given item', async(done): Promise<any> => {
      const testData: IProductRecord = {
        id: testProductIds[0],
        name: 'does not matter',
        current_price: {
          value: 98.76,
          currency_code: 'USD'
        }
      };

      axios.put(`http://localhost:80/products/${testProductIds[0]}`,
        testData
      ).then((): void => {
        axios.get(`http://localhost:80/products/${testProductIds[0]}`).then((response: any): void => {
          expect(response.data.current_price).toEqual(testData.current_price);
          done();
        });
      });
    });

    it('writes through the cache', (done): void => {
      const testData: IProductRecord = {
        id: testProductIds[0],
        name: 'does not matter',
        current_price: {
          value: 122.76,
          currency_code: 'USD'
        }
      };

      axios.put(`http://localhost:80/products/${testProductIds[0]}`,
        testData
      ).then((): void => {
        // @ts-ignore
        const cache = ItemInfoService.cache;
        const val = cache.get(testData.id);
        // @ts-ignore
        console.log('CACHE ENTRY: ', cache.records.get(`${testData.id}`));
        const price = val.current_price.value;
        expect(price).toEqual(testData.current_price.value);
        done();
      });
    });
  });
});
