import { PoolConfig } from "pg";

const truthyValues = new Set(["1", "true", "yes", "on"]);

export function getPostgresConnectionString() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL не установлен");
  }

  return connectionString;
}

export function shouldUsePostgresSsl() {
  const value = process.env.POSTGRES_SSL;

  // For local Docker Postgres we keep SSL disabled by default.
  if (!value) {
    return false;
  }

  return truthyValues.has(value.toLowerCase());
}

export function getPoolConfig(): PoolConfig {
  const connectionString = getPostgresConnectionString();

  if (shouldUsePostgresSsl()) {
    return {
      connectionString,
      ssl: { rejectUnauthorized: false },
    };
  }

  return { connectionString };
}
