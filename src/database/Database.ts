import path from 'path';
import fs from 'fs';
import LocalPricesStore from './LocalPricesStore';
import PricesStore from './PricesStore';
import { IDatabaseConfig } from './IDatabaseConfig'

export default class Database {
  private dataDir: string;
  private pricesStore: PricesStore;
  constructor(config: any) {
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

  get PricesStore(): PricesStore {
    return this.pricesStore;
  }

  private setupPricesStore(config: IDatabaseConfig): void {
    const dataFilePath = path.resolve(this.dataDir, config.dataFile);

    // Ensure that the data file is there
    if (!fs.existsSync(dataFilePath)) {
      // This will create the file if it does not exist.
      // Assuming the system is secure, so give lax file permissions
      const fd = fs.openSync(dataFilePath, 'w+', 777);
      fs.closeSync(fd);
    }
      
    this.pricesStore = new LocalPricesStore(dataFilePath);
  }
};
