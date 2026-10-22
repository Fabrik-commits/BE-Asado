import "dotenv/config";

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const brevo: { apiKey: string; url: string } = {
  apiKey: getRequiredEnv("BREVO_API_KEY"),
  url: getRequiredEnv("BREVO_URL"),
};
export const adminMail: string = getRequiredEnv("ADMIN_MAIL");

export const jwtPrivateKey: string = getRequiredEnv("JWTPRIVATEKEY");
