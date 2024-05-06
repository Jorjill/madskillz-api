const { Pool } = require('pg');
const dbConfig = require('../config/dbConfig');
const nodePgMigrate = require('node-pg-migrate').default;

const pool = new Pool(dbConfig);

const migrateDatabase = async () => {
  const migrationOptions = {
    databaseUrl: process.env.DATABASE_URL,
    dir: "migrations",
    migrationsTable: "pgmigrations",
    direction: "up",
    count: Infinity,
  };

  try {
    const result = await nodePgMigrate(migrationOptions);
    console.log("Migrations are successful", result);
  } catch (error) {
    console.error("Migration failed", error);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  migrateDatabase
};
