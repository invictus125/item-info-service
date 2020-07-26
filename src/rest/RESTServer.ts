import { IServerConfig, IPathConfig } from './IServerConfig';
const express = require('express');

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

  constructor() {
    this.server = express();
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
    this.server.get(config.path, config.getCallback);
          
    // Handle the optional action.
    if (config.putCallback) {
      this.server.put(config.path, config.putCallback);
    }
  }
};
