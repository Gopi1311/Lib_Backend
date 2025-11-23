import dotenv from "dotenv";
dotenv.config();

function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
  return value;
}

export const config = {
  PORT: getEnvVariable("PORT"),
  MONGO_URL: getEnvVariable("MONGO_URL"),
};
