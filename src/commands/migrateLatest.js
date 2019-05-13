const path = require('path');
const { invariant } = require('../utils');

const HELP_MESSAGE = `
Run all migrations that have not yet been run.
Usage:
  migrate:latest
  migrate:latest [options]
Options:
  --config [path]   Path to config file. Default: './knexneo4jfile.js',
  --env [name]      Environment, default: process.env.NODE_ENV || development
`;

module.exports = {
  name: 'migrate:latest',
  description: 'Run all migrations that have not yet been run.',
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

    async function doMigration(dir, migrationName) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const content = require(filesystem.path(dir, migrationName));

      invariant(
        typeof content.up !== 'function',
        `"up" function is required in migration file: ${migrationName}`,
      );

      await content.up(extensions.db.run);
      await extensions.db.setCurrentMigration({
        name: migrationName,
        migration_time: Date.now(),
      });

      success(`Migration ${migrationName} has been successfully done.`);
    }

    try {
      await extensions.config.init();
      const { dir, fileExtensions } = extensions.context.read('config');

      const files = await filesystem.list(dir);
      invariant(
        !files,
        `The migrations directory not found at path: ${dir}`,
      );

      const allMigrations = files.filter(
        // prettier-ignore
        (i) => fileExtensions.includes(path.extname(i)),
      );
      invariant(
        allMigrations.length === 0,
        `There are no migration files in the directory: ${dir}`,
      );

      allMigrations.sort();

      extensions.db.init();
      const currentMigration = await extensions.db.getCurrentMigration();

      const newMigrations = currentMigration
        ? allMigrations.filter((item) => item > currentMigration.name)
        : allMigrations;

      if (newMigrations.length === 0) {
        info('Already up to date');
        return;
      }

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const migration of newMigrations) {
        await doMigration(dir, migration);
      }
      /* eslint-enable */

      success('Done.');
    } catch (e) {
      error(`Error during migration.\n${e.message}`);
    } finally {
      extensions.db.close();
    }
  },
};
