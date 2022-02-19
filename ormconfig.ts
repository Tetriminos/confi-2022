import baseDbConfig from './src/config/db.config';

const dbConfig = baseDbConfig();

const dbConfiguration = () => {
  return [
    // default config used for cli migrations
    {
      ...dbConfig,
      // had to remove __dirname from the path for the cli to function
      migrations: ['src/db/migrations/*{.ts,.js}'],
    },
    // seed config, we abuse migrations to accomplish seeding
    {
      name: 'seed',
      ...dbConfig,
      // different table name so regular migration reversal doesn't break
      migrationsTableName: 'seeds',
      // ...and a different directory for seed migrations
      migrations: ['src/db/seeds/*{.ts,.js}'],
      cli: {
        migrationsDir: 'src/db/seeds',
      },
    },
  ];
};

export default dbConfiguration();
