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
  JWT_ACCESS_SECRET:getEnvVariable("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET:getEnvVariable("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES:getEnvVariable("JWT_ACCESS_EXPIRES"),
  JWT_REFRESH_EXPIRES:getEnvVariable("JWT_REFRESH_EXPIRES"),
  NODE_ENV:getEnvVariable("NODE_ENV"),
  BCRYPT_SALT_ROUNDS:getEnvVariable("BCRYPT_SALT_ROUNDS")
};
