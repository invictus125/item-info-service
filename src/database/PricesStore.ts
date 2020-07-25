import fs from 'fs';
import { IPriceRecord } from './IPriceRecord';
const nosql = require('nosql');

export default class PricesStore {
    private db: any;

    constructor(filePath: string) {
        if (fs.existsSync(filePath)) {
            this.db = nosql.load(filePath);
        } else {
            throw new Error('PricesStore: Invalid data file! ' + filePath);
        }
    }

    /**
     * Inserts an IPriceRecord into the data file, verifying first that it is unique.
     * @param record {IPriceRecord} The record to insert
     */
    public create(record: IPriceRecord): Promise<IPriceRecord> {
        return new Promise((resolve, reject): void => {
            this.db.insert(record, true).callback((err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(record);
                }
            });
        });
    }

    public read(id: number): Promise<Array<IPriceRecord>> {
        return new Promise((resolve, reject): void => {
            this.db.find().where('id', id).callback((err: Error, record: any): void => {
                if (err) {
                    reject(err);
                } else {
                    resolve(record);
                }
            });
        });
    }

    public update(record: IPriceRecord): Promise<number> {
      return new Promise((resolve, reject): void => {
        this.db.update(record, true).make((builder: any) => {
          // builder.first(); --> updates only the one document
          builder.where('id', record.id);
          builder.callback((err: Error, count: number): void => {
            if (err) {
              reject(err);
            } else {
              resolve(count);
            }
          });
      });
      });
    }
};
