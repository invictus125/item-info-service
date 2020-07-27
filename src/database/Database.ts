import path from 'path';
import fs from 'fs';
import LocalPricesStore from './LocalPricesStore';
import PricesStore from './PricesStore';
import { IDatabaseConfig } from './IDatabaseConfig';

export default class Database {
  private dataDir: string;
  private pricesStore: PricesStore;
  public constructor(config: any) {
    this.dataDir = config.path;
    if (!fs.existsSync(this.dataDir)) {
      // Create the data directory
      fs.mkdirSync(this.dataDir);
    }

    // Set up the prices store.
    if (config.prices) {
      this.setupPricesStore(config.prices);
    }
  }

  public get PricesStore(): PricesStore {
    return this.pricesStore;
  }

  private setupPricesStore(config: IDatabaseConfig): void {
    const dataFilePath = path.resolve(this.dataDir, config.dataFile);
    this.pricesStore = new LocalPricesStore(dataFilePath);
  }
}
