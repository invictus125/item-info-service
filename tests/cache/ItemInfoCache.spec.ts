import ItemInfoCache from '../../src/cache/ItemInfoCache';
import { waitMs } from '../../src/util';

describe('ItemInfoCache', (): void => {
  const cache: any = new ItemInfoCache({
    disabled: false,
    maxItems: 10,
    recordLifetimeMs: 60000,
    cleanPeriodMs: 5000,
    syncPeriodMs: 10000
  });

  let testEntry = {
    id: 1,
    name: 'testing1',
    current_price: { value: 10.99, currency_code: 'USD' }
  };

  describe('write', (): void => {
    let firstTimeEntry;
    it('adds an entry to the cache', (): void => {
      cache.write(testEntry);
      expect(cache.records.size).toBe(1);
      expect(cache.records.get(testEntry.id).data).toEqual(testEntry);
      expect(cache.timeArray.length).toBe(1);
      firstTimeEntry = cache.timeArray[0];
    });

    it('updates an entry in the cache', (): void => {
      testEntry = {
        id: 1,
        name: 'testing123',
        current_price: { value: 10.95, currency_code: 'USD' }
      };
      cache.write(testEntry);
      expect(cache.records.size).toBe(1);
      expect(cache.records.get(testEntry.id).data).toEqual(testEntry);
      expect(cache.timeArray.length).toBe(1);
      expect(cache.timeArray[0]).not.toEqual(firstTimeEntry);
    });

    it('removes the oldest records when there are too many', async(): Promise<any> => {
      for (let i = 2; i < 12; i++) {
        cache.write({
          id: i,
          name: `testing${i}`,
          current_price: { value: i, currency_code: 'USD' }
        });
        await waitMs(2);
      }
      expect(cache.records.size).toBe(10);
    });
  });

  describe('get', (): void => {
    it('gets an entry out of the cache', (): void => {
      cache.write(testEntry);
      expect(cache.get(testEntry.id)).toEqual(testEntry);

      console.log('timeArray ', cache.timeArray);
    });

    it('returns null if no such entry exists', (): void => {
      expect(cache.get(222)).toBeNull();
    });
  });

  describe('clean', (): void => {
    it('cleans out entries which are too old to keep', async(): Promise<any> => {
      const timeArrayLength = cache.timeArray.length;
      const startElement = cache.timeArray[0];
      for (let i = 0; i < 5; i++) {
        cache.timeArray.unshift({ time: 1000+i, id: 100+i });
        cache.records.set(100+i, { time: 1000+i, data: { id: 100+i } });
      }
      await cache.clean();
      expect(cache.timeArray.length).toEqual(timeArrayLength);
      expect(cache.timeArray[0]).toEqual(startElement);
    });
  });
});
