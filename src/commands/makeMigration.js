const { yyyymmddhhmmss, invariant } = require('../utils');

const HELP_MESSAGE = `
Create a named migration file.
Usage:
  migrate:make <name>
  migrate:make <name> [options]
Options:
  --config [path]   Path to config file. Default: './knexneo4jfile.js'
`;

module.exports = {
  name: 'migrate:make',
  description: 'Create a named migration file.',
  run: async (toolbox) => {
    const {
      print: { error, info, success },
      extensions,
      parameters,
      template,
      filesystem,
    } = toolbox;

    const { first: name, options } = parameters;

    if (options.help || options.h) {
      info(HELP_MESSAGE);
      return;
    }

    try {
      invariant(
        !name,
        'Parameter "name" is required while creating migration file',
      );

      await extensions.config.init();

      const { dir } = extensions.context.read('config');
      const target = filesystem.path(dir, `${yyyymmddhhmmss()}_${name}.js`);
      await extensions.filesystem.touch(target);
      await template.generate({
        template: 'migration.ejs',
        target,
      });

      success(`Created Migration: ${target}`);
    } catch (e) {
      error(`Error while creating migration file.\n${e.message}`);
    }
  },
};
