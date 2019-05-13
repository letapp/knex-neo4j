# knex-neo4j CLI

> A simple knex like CLI for neo4j migrations

## Installation
```bash
$ npm i @letapp/knex-neo4j
```

## Available commands

Use `--help` to see all available commands:

```bash
$ knex-neo4j --help
```

When a command is specified, use `--help` to see all available command options, e.g.:

```bash
$ knex-neo4j migrate:latest --help
```

#### init

Migrations use a config file (default `knexneo4jfile.js`), which specify various configuration settings for the module. To create a new config file, run the following:

```bash
$ knex-neo4j init
```
More details in [the configuration section](#configuration-file)

#### migrate:make

Once you have a config file, you can use the migration tool to create migration files to the specified directory (default `migrations/neo4j`). Creating new migration files can be achieved by running:

```bash
$ knex-neo4j migrate:make migration_name
```

Migration file will look like this:
```js
exports.up = (run) => {
  return run(
    // query, params
  );
};

exports.down = (run) => {
  return run(
    // query, params
  );
};
```
Migration function accepts async function `run`, you can use `async/await` syntax to run a query or return `run` with specified query and params.


#### migrate:latest

Once you have finished writing the migrations, you can update the database by running:

```bash
$ knex-neo4j migrate:latest
```

#### migrate:rollback

To rollback the last migration:

```bash
$ knex-neo4j migrate:rollback
```

#### migrate:currentVersion

View the current version for the migration:

```bash
$ knex-neo4j migrate:currentVersion
```

## Configuration file

A config file generally contains all of the configuration for your database. It can optionally provide different configuration for different environments and additional options for migrations. You may pass a `--config` option to any of the command line statements to specify an alternate path to your config file (default `knexneo4jfile.js`).

```bash
$ knex-neo4j init --config configs/config_name.js
```

#### Basic configuration:

```js
module.exports = {
  connection: 'bolt://localhost:7687',
  user: 'user',
  password: 'password',
};
```

#### Environment configuration:

```js
module.exports = {
  development: {
    connection: 'bolt://localhost:7687',
    user: 'user',
    password: 'password',
  },

  production: {
    connection: '',
    user: '',
    password: '',
  },
};
```
You can also pass the `--env` option or set `NODE_ENV` to any of the command line statements to select an alternative environment.

```bash
$ knex-neo4j migrate:latest --env production

# or

$ NODE_ENV=production knex-neo4j migrate:latest
```

#### Additional configurations

You can add additional fields to your config file:

- directory - a relative path to the directory containing the migration files (default `./migrations/neo4j`).
- storageNode - the node label used for storing the migration state (default `KNEX_NEO4J_MIGRATION`)

```js
{
  connection: '',
  user: '',
  password: '',
  directory: './path_to_migrations_dir',
  storageNode: 'MIGRATION_NODE_LABEL',
}
```

# License
MIT - see LICENSE
