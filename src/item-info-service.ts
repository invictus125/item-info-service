import { generateDefaultConfiguration } from './IServiceConfig';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import ItemInfoService from './ItemInfoService';

function printHelp(): void {
  console.log(`
  item-info-service usage
    -c|-C|--config [configuration file path] : Allows use of an external configuration file. Should be in JSON format.
    -h|-H|--help : Prints the usage information for the program.
    -d|-D|--debug : Puts the program in debug mode and gets more console output.
  `);
}

/**
 * Read command line input, check for configuration file.
 */
let debug = false;
let configPath = null;
const args = process.argv;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.match(/-h|--help|help/i)) {
    printHelp();
    process.exit(0);
  } else if (arg.match(/-c|--config/i)) {
    if (i+1 < args.length) {
      i++;
      configPath = args[i];
    } else {
      console.log('Config file path must be provided to use the -c/-C/--config option!');
      process.exit(0);
    }
  } else if (arg.match(/-d|--debug/i)) {
    debug = true;
  }
}

// Generate a default configuration.
let config = generateDefaultConfiguration();

// Read the specified configuration file if there is one.
let userConfig = {};
if (configPath) {
  configPath = path.resolve(configPath);
  try {
    userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch(e) {
    console.error(`Unable to process config file at ${configPath}.  Using default configuration.`);
  }
}

// Merge any user configuration with the default configuration, overwriting any defaults with the user config values.
config = _.merge(config, userConfig);

ItemInfoService.start(config, debug);
