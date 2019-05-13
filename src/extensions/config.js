const { attachExtensions, invariant } = require('../utils');

const CONFIG_FILE = './knexneo4jfile.js';

const DEFAULT_CONFIG = {
  directory: './migrations/neo4j',
  storageNode: 'KNEX_NEO4J_MIGRATION',
  fileExtensions: ['.js'],
};

module.exports = (toolbox) => {
  const {
    parameters,
    filesystem,
    print: { info },
  } = toolbox;
  const { options } = parameters;

  const configPath = options.config || CONFIG_FILE;

  async function init() {
    const founded = await filesystem.exists(configPath);
    invariant(
      founded !== 'file',
      `Configuration file not found at path: ${configPath}`,
    );

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const configContent = require(filesystem.path(configPath));

    const env = options.env || process.env.NODE_ENV;
    const defaultEnv = 'development';

    if (env) info(`Using environment: ${env}`);

    const config = configContent[env || defaultEnv] || configContent;

    invariant(
      !config.connection,
      'Field "connection" is required in configuration file',
    );
    if (!config.connection) {
      throw new Error('Field "connection" is required in configuration file');
    }

    invariant(
      !config.user,
      'Field "user" is required in configuration file',
    );

    invariant(
      !config.password,
      'Field "password" is required in configuration file',
    );

    toolbox.extensions.context.write('config', {
      ...config,
      dir: config.directory || DEFAULT_CONFIG.directory,
      storageNode: config.storageNode || DEFAULT_CONFIG.storageNode,
      fileExtensions: config.fileExtensions || DEFAULT_CONFIG.fileExtensions,
    });
  }

  attachExtensions(toolbox, 'config', {
    init,
  });
};
