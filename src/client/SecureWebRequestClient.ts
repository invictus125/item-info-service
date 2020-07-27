import * as HTTPS from 'https';
import * as HTTP from 'http';

/**
 * Class designed to easily get JSON and string responses from a single HTTPS endpoint using GET on any path and parameter sets.
 */
export default class SecureWebRequestClient {
  private baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    if (this.baseUrl[this.baseUrl.length-1] === '/') {
      this.baseUrl = this.baseUrl.substr(0, this.baseUrl.length - 1);
    }
  }

  /**
   * Gets a response from a given path and with the given optional parameters, but treats it as JSON and converts it to an object.
   * An exception will be thrown if the received data is not valid JSON.
   * @param path - Array of path parts to combine into a full path.  Can also just be a single element array containing the full path.
   * @param options (optional) - An object containing key/value pairs to be used as parameters in the HTTPS GET request.
   */
  public async getJsonResponse(path: string[], options?: object): Promise<object> {
    return JSON.parse(await this.getResponse(path, options));
  }

  /**
   * Gets a string response from a given path and with the given optional parameters. The string returned will be whatever data the server responded with.
   * @param path - Array of path parts to combine into a full path. Can also just be a single element array containing the full path.
   * @param options (optional) - An object containing key/value pairs to be used as parameters in the HTTPS GET request.
   */
  public getResponse(path: string[], options?: object): Promise<string> {
    return new Promise((resolve): void => {
      HTTPS.get(this.buildRequestPath(path, options), (res: HTTP.IncomingMessage): void => {
        let responseData = '';
        res.on('data', (d: any): void => {
          responseData += d;
        });
        res.on('end', (): void => {
          resolve(responseData);
        });
      });
    });
  }

  /**
   * Builds an HTTPS URL to send a GET request to.
   * The base URL will be used, and any information in path will be added. Any key/value pairs in options will be added at the end, following standard
   * convention for request parameters.
   * @param path - Array of path parts to combine into a full path. Can also just be a single element array containing the full path.
   * @param options (optional) - An object containing key/value pairs to be used as parameters in the HTTPS GET request.
   */
  private buildRequestPath(path: string[], options?: object): string {
    // Transform the path into the full path using the base URL
    let reqPath = `${this.baseUrl}/${path.join('/')}`;

    // Handle key value pairs to be used as parameters in the HTTP request
    if (options) {
      const optionKeys = Object.keys(options);
      if (optionKeys.length > 0) {
        reqPath += '?';
        for (const key of optionKeys) {
          // @ts-ignore
          reqPath += `${key}=${options[key]}`;
        }
      }
    }

    return reqPath;
  }
}
