const path = require('path');
const { invariant } = require('../utils');

const HELP_MESSAGE = `
Rollback the last migration performed.
Usage:
  migrate:rollback
  migrate:rollback [options]
Options:
  --config [path]   Path to config file. Default: './knexneo4jfile.js',
  --env [name]      Environment, default: process.env.NODE_ENV || development
`;

module.exports = {
  name: 'migrate:rollback',
  description: 'Rollback the last migration performed.',
  run: async (toolbox) => {
    const {
      print: { error, info, success },
      extensions,
      filesystem,
      parameters,
    } = toolbox;

    const { options } = parameters;
    if (options.help || options.h) {
      info(HELP_MESSAGE);
      return;
    }

    try {
      await extensions.config.init();
      const { dir, fileExtensions } = extensions.context.read('config');
      extensions.db.init();

      const current = await extensions.db.getCurrentMigration();
      if (!current) {
        info('There are no applied migrations');
        return;
      }

      const migrationPath = filesystem.path(dir, current.name);
      const fileType = await filesystem.exists(migrationPath);
      invariant(
        fileType !== 'file',
        `Migration file does not exist: ${migrationPath}`,
      );

      // eslint-disable-next-line global-require, import/no-dynamic-require
      const content = require(migrationPath);
      invariant(
        typeof content.down !== 'function',
        `"down" function is required in migration file: ${current.name}`,
      );

      await content.down(extensions.db.run);

      const files = await filesystem.list(dir);
      const allMigrations = files.filter(
        // prettier-ignore
        (i) => fileExtensions.includes(path.extname(i)),
      );

      allMigrations.sort();
      allMigrations.reverse();

      const prevMigration = allMigrations.length > 0
        ? allMigrations.find((item) => item < current.name)
        : null;

      await extensions.db.setCurrentMigration(
        prevMigration
          ? {
            name: prevMigration,
            migration_time: Date.now(),
          }
          : {},
      );

      success(`Rollback ${current.name} has been successfully done.`);
    } catch (e) {
      error(`Error during rollback.\n${e.message}`);
    } finally {
      extensions.db.close();
    }
  },
};
