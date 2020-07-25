import fs from 'fs';
import { IPriceRecord } from './IPriceRecord';
const nosql = require('nosql');

export default class PricesStore {
    private db: any;

    constructor(filePath: string) {
        if (fs.existsSync(filePath)) {
            nosql.load(filePath);
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

    public read(id: number): Promise<IPriceRecord> {
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
};
