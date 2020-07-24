import { IServerConfiguration } from './IServerConfiguration';
const express = require('express');

/*
* Extremely basic default configuration. Should generally only be used for testing.
*/
const defaultConfig: IServerConfiguration = {
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

export default class RESTServer {
  private server: any;

  constructor() {
    this.server = express();
  }

  public start(config: IServerConfiguration = defaultConfig): void {
    // Set up paths and callbacks per the configuration.
    for (const request of config.paths) {
      // Every path will have a get callback at a minimum in our service.
      this.server.get(request.path, request.getCallback);
      
      // Handle the optional action.
      if (request.putCallback) {
        this.server.put(request.path, request.putCallback);
      }
    }

    // Start listening for requests.
    this.server.listen(config.port);
  }
};
