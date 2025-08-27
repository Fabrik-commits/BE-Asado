import "dotenv/config";

export const brevo: { apiKey: string; url: string } = {
  apiKey: process.env.BREVO_API_KEY,
  url: process.env.BREVO_URL,
};
export const adminMail: string = process.env.ADMIN_MAIL;

export const jwtPrivateKey: string = process.env.JWTPRIVATEKEY;
