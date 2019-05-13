const HELP_MESSAGE = `
View the current version for the migration.
Usage:
  migrate:currentVersion
  migrate:currentVersion [options]
Options:
  --config [path]   Path to config file. Default: './knexneo4jfile.js',
  --env [name]      Environment, default: process.env.NODE_ENV || development
`;

module.exports = {
  name: 'migrate:currentVersion',
  description: 'View the current version for the migration.',
  run: async (toolbox) => {
    const {
      print: { error, info },
      extensions,
      parameters,
    } = toolbox;

    const { options } = parameters;
    if (options.help || options.h) {
      info(HELP_MESSAGE);
      return;
    }

    try {
      await extensions.config.init();
      extensions.db.init();
      const migration = await extensions.db.getCurrentMigration();

      if (migration) {
        info(
          `Current Migration: ${migration.name}\nMigrated at: ${
            migration.migration_time
          }`,
        );
      } else {
        info('There are no applied migrations yet');
      }
    } catch (e) {
      error(`Error while getting current migration.\n${e.message}`);
    } finally {
      extensions.db.close();
    }
  },
};
