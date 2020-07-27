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

  public start(config: IServerConfig = defaultConfig): void {
    // Set up paths and callbacks per the configuration.
    for (const request of config.paths) {
      this.addPath(request);
    }

    // Start listening for requests.
    this.server.listen(config.port);
  }

  public addPath(config: IPathConfig): void {
    // Every path will have a get callback at a minimum in our service.
    this.server.get(config.path, this.handleGet.bind(this, config.getCallback));

    // Handle the optional action.
    if (config.putCallback) {
      this.server.put(config.path, this.handlePut.bind(this, config.putCallback));
    }
  }

  private async handleGet(dataCb: Function, request: express.Request, response: express.Response): Promise<any> {
    try {
      const data = await dataCb(request.params.id);
      response.send(data);
    } catch(e) {
      response.status(404).end();
    }
  }

  private async handlePut(dataCb: Function, request: express.Request, response: express.Response): Promise<any> {
    try {
      const data = await dataCb(request.params.id, request.body);
      response.send(data);
    } catch(e) {
      response.status(500).end();
    }
  }
}
