import { IProductRecord } from '../IProductRecord';
import { ICacheConfig } from './ICacheConfig';
import { waitMs } from '../util';

const FIVE_SECONDS_MS = 1000;
const SYNC_MIN_VALUE = 1800000; // 30 minutes
const CLEAN_MIN_VALUE = 60000; // 1 minute

interface ICacheRecord {
  time: number;
  data: IProductRecord;
}

interface ITimeArrayRecord {
  time: number;
  id: number;
}

/**
 * A cache to store recently accessed item records.
 * The cache can be configured to sync data using a callback function.
 * It can also be configured to maintain a certain size or clear out records of a certain age.
 * An array of time records is used to determine when each cache record was last touched by a write or get.
 * Cache records which are not touched will be purged periodically.
 */
export default class ItemInfoCache {
  private maxSize: number;
  private maxLifetime: number;
  private records: Map<number, ICacheRecord> = new Map(); // Stores the records keyed by their ID
  private timeArray: Array<ITimeArrayRecord> = []; // Used to store records of when each record is touched by a write or get operation
  private syncTimer: any;
  private cleanTimer: any;
  private itemSyncCallback: Function;
  private purgeScheduled = false;

  public constructor(config: ICacheConfig) {
    const cleanTimeout = config.cleanPeriodMs < CLEAN_MIN_VALUE ? CLEAN_MIN_VALUE : config.cleanPeriodMs;
    const syncTimeout = config.syncPeriodMs < SYNC_MIN_VALUE ? SYNC_MIN_VALUE : config.syncPeriodMs;
    this.maxSize = config.maxItems;
    this.maxLifetime = config.recordLifetimeMs;
    this.itemSyncCallback = config.itemSyncCallback;

    // Set up interval timers for internal sync anc clean functions
    if (typeof this.itemSyncCallback === 'function') {
      this.syncTimer = setInterval(this.sync.bind(this), syncTimeout);
    }
    this.cleanTimer = setInterval(this.clean.bind(this), cleanTimeout);
  }

  public destroy(): void {
    clearInterval(this.syncTimer);
    clearInterval(this.cleanTimer);
    this.records = null;
    this.timeArray = [];
  }

  /**
   * Writes or overwrites a record in the cache, also updating the time array.
   * @param record - The product record to add or update in the cache.
   */
  public write(record: IProductRecord): void {
    const time = Date.now();
    const currentRec = this.records.get(record.id);

    // We remove the defunct record from the time array in this case because writes can be a little slower than gets.
    // If the get is slow it defeats the whole purpose of the cache.
    if (currentRec) {
      this.removeFromTimeArray(currentRec);
    }

    // Build the new cache entry
    const entry: ICacheRecord = {
      time,
      data: record
    };

    // Place the entry into the structures.
    this.addToTimeArray(entry);
    this.records.set(entry.data.id, entry);

    // If we're over max size, remove the oldest entries
    const sizeDelta = this.records.size - this.maxSize;
    if (sizeDelta > 0) {
      this.removeOldest(sizeDelta);
    }
  }

  /**
   * Retrieves a record from the cache and returns its product data.
   * Time array is updated with the last time the record was touched.
   * @param id - The ID of the record to retrieve
   */
  public get(id: number): IProductRecord {
    const record = this.records.get(id);

    if (record) {
      // Update the maps
      const time = Date.now();
      const entry: ICacheRecord = {
        time,
        data: record.data
      };

      // Update the time it was touched along with the record
      this.addToTimeArray(entry);
      this.records.set(entry.data.id, entry);

      // If the time array has twice the max cache size in entries, it means we have a lot of defunct records.
      // This can happen if a subset of records are getting touched very frequently and a lot of time entries are
      // getting added for the same entry.  If this happens, set a timeout to purge the defunct records after five seconds.
      // The delay allows the current response to make it back to the client, and any other operations to be served as well.
      if (!this.purgeScheduled && this.timeArray.length > this.maxSize * 2) {
        this.purgeDefunctTimeRecords();
      }

      // Return the record
      return record.data;
    }

    // Only happens if the record is not found
    return null;
  }

  /**
   * Goes through the cache record by record and uses the item sync callback
   * to get updated data for each one.
   * This is slow and should not be done often, and possibly not at all.
   */
  private async sync(): Promise<any> {
    const ids = this.records.keys();
    let id = ids.next();
    while (id) {
      const currentRecord = this.records.get(id.value);
      const updatedData = this.itemSyncCallback(id.value);
      currentRecord.data = updatedData;
      this.records.set(id.value, currentRecord);
      id = ids.next();
    }
  }

  /**
   * Removes entries which have reached their age limit from the time array and the records map.
   */
  private async clean(): Promise<any> {
    const time = Date.now();
    const timeThreshold = time - this.maxLifetime;
    let numToRemove = 0;

    // Oldest elements are at the start of the array
    for (let i = 0; i < this.timeArray.length; i++) {
      if (this.timeArray[i].time <= timeThreshold) {
        numToRemove++;
      } else {
        i = this.timeArray.length;
      }
    }

    // Remove the oldest entries as needed
    if (numToRemove > 0) {
      this.removeOldest(numToRemove);
    }
  }

  /**
   * Removes the corresponding time entry for the given record from the time array.
   * @param record - The record for which to remove a time entry
   */
  private removeFromTimeArray(record: ICacheRecord): void {
    const position = this.timeArray.findIndex(
      (value: ITimeArrayRecord): boolean => { return value.id === record.data.id; }
    );
    if (position > -1) {
      this.timeArray.splice(position, 1);
    }
  }

  /**
   * Adds a time entry to the end of the time array for a given record.
   * @param record - The record to add a time entry for
   */
  private addToTimeArray(record: ICacheRecord): number {
    return this.timeArray.push({
      time: record.time,
      id: record.data.id
    });
  }

  /**
   * Removes the first N records from the start of the time array, where N is the amount specified.
   * The oldest entries are guaranteed to be at the start of the array.
   * Also removes them from the records map as they are removed from the time array.
   * @param amount - The number of items to remove
   */
  private removeOldest(amount: number): void {
    for (let i = 0; i < amount; i++) {
      const timeRecord = this.timeArray.shift();
      const record = this.records.get(timeRecord.id);
      if (record && record.time === timeRecord.time) {
        this.records.delete(timeRecord.id);
      } else {
        // This time record was for a touch on an item which was made irrelevant by a later touch.
        i--;
      }
    }
  }

  /**
   * Waits 5 seconds, and then removes defunct time records from the time array.
   * Time records become defunct if the cache record they are tracking a touch on is touched again and another time
   * entry is created for that cache record.
   * This is a slow operation, and should only be done if the time array gets very large.
   */
  private async purgeDefunctTimeRecords(): Promise<any> {
    this.purgeScheduled = true;
    await waitMs(FIVE_SECONDS_MS);
    return new Promise((resolve): void => {
      // eslint-disable-next-line
      for (let i = this.timeArray.length; i >= 0; i--) {
        const timeRec = this.timeArray[i];
        const record = this.records.get(timeRec.id);
        if (record.time !== timeRec.time) {
          this.timeArray.splice(i, 1);
        }
      }
      this.purgeScheduled = false;
      resolve();
    });
  }
}
