const path = require('path');

const CONFIG_FILE = './knexneo4jfile.js';

const HELP_MESSAGE = `
Create a fresh configuration file.
Usage:
  init
  init [options]
Options:
  --config [path]   Path to config file. Default: './knexneo4jfile.js'
`;

module.exports = {
  name: 'init',
  description: 'Create a fresh configuration file.',
  run: async (toolbox) => {
    const {
      print: { error, info, success },
      extensions,
      parameters,
      template,
    } = toolbox;

    const { options } = parameters;
    if (options.help || options.h) {
      info(HELP_MESSAGE);
      return;
    }

    try {
      let target = null;
      if (options.config) {
        target = path.extname(options.config) !== '.js'
          ? `${options.config}.js`
          : options.config;
      } else {
        target = CONFIG_FILE;
      }

      await extensions.filesystem.touch(target);
      await template.generate({
        template: 'config.ejs',
        target,
      });

      success(`Created configuration file: ${target}`);
    } catch (e) {
      error(`Error while creating configuration file.\n${e.message}`);
    }
  },
};
