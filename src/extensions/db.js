const neo4j = require('neo4j-driver').v1;
const { attachExtensions } = require('../utils');

function getRecordValue(record, field) {
  if (!record) return null;

  const value = record.get(field);
  return value.properties || value;
}

module.exports = async (toolbox) => {
  let driver = null;
  let config = null;

  function init() {
    config = toolbox.extensions.context.read('config');
    driver = neo4j.driver(
      config.connection,
      neo4j.auth.basic(config.user, config.password),
    );
  }

  function close() {
    if (!driver) return;
    driver.close();
  }

  async function run(query, props = {}) {
    const session = driver.session();
    const transaction = session.beginTransaction();
    try {
      const result = await transaction.run(query, props);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`DB error:\n${error}`);
    } finally {
      session.close();
    }
  }

  async function getCurrentMigration() {
    const { storageNode } = config;
    const result = await run(`
      MATCH (migration:${storageNode})
      RETURN migration
    `);
    const migration = getRecordValue(result.records[0], 'migration');

    return migration && migration.name ? migration : null;
  }

  function setCurrentMigration(migration) {
    const { storageNode } = config;
    const query = `
      MERGE (migration:${storageNode})
      SET migration = {migration}
    `;

    return run(query, { migration });
  }

  attachExtensions(toolbox, 'db', {
    init,
    close,
    run,
    getCurrentMigration,
    setCurrentMigration,
  });
};
