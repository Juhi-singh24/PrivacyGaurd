import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const appPassword = process.env.APP_PASSWORD;
const emailUser = process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  port:587,
  secure:false,
  auth:{
    user:emailUser,
    pass:appPassword
  }
})

export default transporter;