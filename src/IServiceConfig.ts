import { IDatabaseConfig } from './database/IDatabaseConfig';
import { IServerConfig } from './rest/IServerConfig';
import { IRedSkyConfig } from './client/IRedSkyConfig';
import { ICacheConfig } from './cache/ICacheConfig';

const DEFAULT_DATABASE_PATH =
  process.platform === 'darwin' ? '/Users/shared/myRetail' :
    process.platform === 'win32' ? 'C:\\Users\\Public\\ProgramData\\myRetail' :
      '/home/myRetail';

export interface IServiceConfig {
  cache: ICacheConfig;
  database: {
    path: string;
    prices: IDatabaseConfig;
  };
  redSky: IRedSkyConfig;
  restServer: IServerConfig;
}

function generateDefaultConfiguration(): IServiceConfig {
  const config: IServiceConfig = {
    cache: {
      maxItems: 10000,
      recordLifetimeMs: 86400000, // 1 day
      cleanPeriodMs: 1800000, // 30 minutes
      syncPeriodMs: 21600000 // 6 hours
    },
    database: {
      path: DEFAULT_DATABASE_PATH,
      prices: {
        dataFile: 'prices.nosql'
      }
    },
    redSky: {
      apiVersion: 'v2'
    },
    restServer: {
      port: 80
    }
  };
  return config;
}

export { generateDefaultConfiguration };
