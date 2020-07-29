import { IServerConfig, IPathConfig } from './IServerConfig';
import express from 'express';

/*
* Extremely basic default configuration. Should generally only be used for testing.
*/
const defaultConfig: IServerConfig = {
  port: 80,
  paths: [
    {
      path: '/',
      getCallback: (req: any, res: any): void => {
        res.send('Server is up.');
      }
    }
  ]
};

/**
 * A simple web server designed to respond to HTTP requests.
 * Can be configured to run on any port, and paths/callbacks can be set up using the IPathConfiguration interface in the server configuration.
 */
export default class RESTServer {
  private server: any;

  public constructor() {
    this.server = express();
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
  }

  /**
   * Processes the configuration and starts listening.
   * @param config - Server configuration
   */
  public start(config: IServerConfig = defaultConfig): void {
    // Set up paths and callbacks per the configuration.
    for (const request of config.paths) {
      this.addPath(request);
    }

    // Start listening for requests.
    this.server.listen(config.port);
  }

  /**
   * Sets up a path with a GET handler, and if applicable, a PUT handler.
   * @param config - Path configuration containing at a minimum a string path and a GET handler function
   */
  public addPath(config: IPathConfig): void {
    // Every path will have a get callback at a minimum in our service.
    this.server.get(config.path, this.handleGet.bind(this, config.getCallback));

    // Handle the optional action.
    if (config.putCallback) {
      this.server.put(config.path, this.handlePut.bind(this, config.putCallback));
    }
  }

  /**
   * Processes an Express GET request, retrieves response data, and sends the response.
   * Sends a 404 (not found) HTTP status if an exception occurs during processing of a GET.
   * @param dataCb - The callback to use to get the response data
   * @param request - The Express request object
   * @param response - The Express response object to use to send data back
   */
  private async handleGet(dataCb: Function, request: express.Request, response: express.Response): Promise<any> {
    try {
      // Ensure ID is an integer, not a string
      const data = await dataCb(parseInt(request.params.id));
      response.send(data);
    } catch(e) {
      response.status(404).end();
    }
  }

  /**
   * Processes an Express PUT request, retrieves response data, and sends the response.
   * Sends a 500 (server error) HTTP status if an exception occurs during processing of a PUT.
   * @param dataCb - The callback to use to change the data and retrieve the response
   * @param request - The Express request object
   * @param response - The Express response object to use to send data back
   */
  private async handlePut(dataCb: Function, request: express.Request, response: express.Response): Promise<any> {
    try {
      // Ensure ID is an integer, not a string.
      const data = await dataCb(parseInt(request.params.id), request.body);
      response.send(data);
    } catch(e) {
      response.status(500).end();
    }
  }
}
