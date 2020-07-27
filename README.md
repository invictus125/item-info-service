# item-info-service
Gets an item name and price based on an ID, and allows price updates.

# Installing and Running

The following steps presume that the user already has git, node >= 12.13.0, and NPM installed.

* To install and run in a dev environment:
  - Clone the repo: `git clone https://github.com/invictus125/item-info-service.git`
  - Navigate to the repo directory and run `npm install`.
  - `npm run build`
  - `npm run start`

  The above will result in the service running on http://localhost:80.

  To run in debug mode, `npm run start:debug`.

* There are several command line flags available to change the behavior of the program:
  - -h,-H,--help,help : Prints the command line usage information
  - -c,-C,--config : Allows specification of a configuration file. This file must be in JSON format.
  - -d,-D,--debug : Puts the service in debug mode. Informational messages will be put into stdout, along with performance statistics in some cases.

# Configuration

The default configuration for the service is as follows:

```json
{
  "cache": {
    "disabled": false,
    "maxItems": 10000,
    "recordLifetimeMs": 86400000,
    "cleanPeriodMs": 1800000,
    "syncPeriodMs": 21600000
  },
  "database": {
    "path": DEFAULT_DATABASE_PATH,
    "prices": {
      "dataFile": "prices.nosql"
    }
  },
  "redSky": {
    "apiVersion": "v2"
  },
  "restServer": {
    "port": 80
  }
}
```

Values in this default configuration which are not specifically overridden in a user config file will be used at runtime.

Important values to keep in mind:
* `cache.disabled`
  - Disables the cache, meaning fresh product info will be retrieved from the prices store and the redsky API every time a request is made.
* `cache.syncPeriodMs`
  - Defines how often items in the cache are refreshed from the external data sources. This becomes important if for some reason it's anticipated that product names and/or prices are going to be changing a lot external to the service.
* `database.path`
  - Defines where the database will store its data files. The default value depends on the host OS:
    - Windows: C:\\Users\\Public\\ProgramData\\myRetail
    - Darwin/MacOS: /Users/shared/myRetail
* `restServer.port`
  - Controls which port the service runs on.

A user config file can be specified on the command line, and can have any subset of the configuration within the default structure. For example, a user might choose only to specify the default database path as follows:

```json
{
  "database":
  {
    "path":"/Users/me/myStuff"
  }
}
```

If the configuration file contained the above, the default value for the database path would be overridden, but all other defaults would be used.

# Usage

Once the service is running, it can be accessed using the http protocol on whatever port the service is configured to use.  The service will accept GET and PUT requests on path /products/{id}, where {id} is a numerical product ID existing in the myRetail (redsky) service.

The data format for both the retrieval and the setting of price data is:

```json
{"id":"13860428","name":"The Big Lebowski (Blu-ray)","current_price":{"value":12.49,"currency_code":"USD"}}
```

Note that the PUT request will only update the price, not the name nor the ID.
