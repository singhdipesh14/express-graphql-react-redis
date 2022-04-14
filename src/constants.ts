import dotenv from "dotenv"
dotenv.config()
export const __prod__ = process.env.NODE_ENV === "production"
export const __user__ = process.env.DB_USER
export const __pass__ = process.env.DB_PASSWORD
