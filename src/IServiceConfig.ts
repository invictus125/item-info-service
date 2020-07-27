import { IDatabaseConfig } from './database/IDatabaseConfig';
import { IServerConfig } from './rest/IServerConfig';
import { IRedSkyConfig } from './client/IRedSkyConfig';

const DEFAULT_DATABASE_PATH =
  process.platform === 'darwin' ? '/Users/shared/myRetail' :
    process.platform === 'win32' ? 'C:\\Users\\Public\\ProgramData\\myRetail' :
      '/home/myRetail';

export interface IServiceConfig {
  redSky: IRedSkyConfig;
  database: {
    path: string;
    prices: IDatabaseConfig;
  };
  restServer: IServerConfig;
}

function generateDefaultConfiguration(): IServiceConfig {
  const config: IServiceConfig = {
    redSky: {
      apiVersion: 'v2'
    },
    database: {
      path: DEFAULT_DATABASE_PATH,
      prices: {
        dataFile: 'prices.nosql'
      }
    },
    restServer: {
      port: 80
    }
  };
  return config;
}

export { generateDefaultConfiguration };
