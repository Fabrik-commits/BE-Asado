import "dotenv/config";

export const brevo = {
  apiKey: process.env.BREVO_API_KEY,
  url: process.env.BREVO_URL,
};
export const adminMail = process.env.ADMIN_MAIL;

export const jwtPrivateKey = process.env.JWTPRIVATEKEY;
