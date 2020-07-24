import * as HTTPS from 'https';
import * as HTTP from 'http';

export default class SecureWebRequestClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    if (this.baseUrl[this.baseUrl.length-1] === '/') {
      this.baseUrl = this.baseUrl.substr(0, this.baseUrl.length - 1);
    }
  }

  /**
   * 
   * @param path - Array of path parts to combine into a full path.
   * @param options 
   */
  public async getJsonResponse(path: string[], options?: object): Promise<object> {
    return JSON.parse(await this.getResponse(path, options));
  }

  public getResponse(path: string[], options?: object): Promise<string> {
    return new Promise((resolve): void => {
      HTTPS.get(this.buildRequestPath(path, options), (res: HTTP.IncomingMessage): void => {
        let responseData: string = '';
        res.on('data', (d: any): void => {
          responseData += d;
        });
        res.on('end', (): void => {
          resolve(responseData);
        });
      });
    });
  }

  private buildRequestPath(path: string[], options?: object): string {
    // Transform the path into the full path using the base URL
    let reqPath = this.baseUrl;
    for (const part of path) {
      reqPath += `/${part}`;
    }

    // Handle key value pairs to be used as parameters in the HTTP request
    if (options) {
      const optionKeys = Object.keys(options);
      if (optionKeys.length > 0) {
        reqPath += '?';
        for (const key of optionKeys) {
          // @ts-ignore
          reqPath += `${key}=${options[key]}`
        }
      }
    }

    return reqPath;
  }
};
