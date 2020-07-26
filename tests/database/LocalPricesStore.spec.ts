import path from 'path';
import PricesStore from '../../src/database/LocalPricesStore';
import { IPriceRecord } from '../../src/database/IPriceRecord';
import fs from 'fs';
const _ = require('lodash');

describe('PricesStore', (): void => {
  const dbFile = path.resolve(process.cwd(), 'tests','database','testDB.nosql');
  let pStore: PricesStore = new PricesStore(dbFile);

  const firstRecord: IPriceRecord = {
    id: 1234,
    price: { value: 12.99, currency: 'USD' },
    metaData: {}
  };

  afterAll((): void => {
    fs.truncate(dbFile, 0, () => {});
  });

  describe('create', (): void => {
    it('creates a single record', async(): Promise<any> => {
      // Really just looking to make sure no error is thrown here.
      // Creation of the record will be verified in other tests.
      await pStore.create(firstRecord);
    });
  });

  describe('read', (): void => {
    it('reads a single record', async(): Promise<any> => {
      const records = await pStore.read('id', firstRecord.id);
      expect(records[0]).toEqual(firstRecord);
    });
  });

  describe('update', (): void => {
    it('updates a single record', async(): Promise<any> => {
      const updatedRecord: IPriceRecord = _.cloneDeep(firstRecord);
      updatedRecord.price.value = 12.01;
      const numUpdated = await pStore.update(updatedRecord);
      expect(numUpdated).toBe(1);
      const records = await pStore.read('id', firstRecord.id);
      expect(records[0]).toEqual(updatedRecord);
    });
  });
});
