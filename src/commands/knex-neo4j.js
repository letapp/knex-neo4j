const INFO_MESSAGE = `
Welcome to the knex-neo4j migration CLI.
Please use --help to see all available commands.
`;

module.exports = {
  name: 'knex-neo4j',
  description: 'knex-neo4j migration CLI',
  run: async (toolbox) => {
    const { print } = toolbox;

    print.info(INFO_MESSAGE);
  },
};
