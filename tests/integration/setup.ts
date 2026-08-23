import "dotenv/config";

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
} else if (process.env.INTEGRATION_DATABASE_NAME && process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `/${process.env.INTEGRATION_DATABASE_NAME}`;
  process.env.DATABASE_URL = url.toString();
}
