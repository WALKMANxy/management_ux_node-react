import nodemailer from "nodemailer";
import { config } from "../config/config";
import logger from "./logger"; // Assuming logger is in the same directory

const transporter = nodemailer.createTransport({
  host: "smtps.aruba.it",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: config.smtpUser, // Your Aruba email username
    pass: config.smtpPass, // Your Aruba email password
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.baseUrl}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: '"Ricambi Centro Sud" <ordini.piattaforme@ricambicentrosud.com>', // Your email
    to: email,
    subject: "Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Email Verification</h2>
        <p>Thank you for registering with Ricambi Centro Sud!</p>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #4CAF50; border-radius: 5px; text-decoration: none;">Verify Email</a>
        <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
        <p><a href="${verificationUrl}" style="color: #4CAF50;">${verificationUrl}</a></p>
        <p>Thank you!</p>
        <p>Ricambi Centro Sud Team</p>
      </div>
    `,
    text: `Please verify your email by clicking the following link: ${verificationUrl}`,
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    logger.info("Verification email sent", {
      email,
      verificationUrl,
      response,
    });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to send verification email", {
        email,
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Failed to send verification email", {
        email,
        error: String(error),
      });
    }
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  passcode: string
) => {
  const resetUrl = `${config.baseUrl}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: '"Ricambi Centro Sud" <ordini.piattaforme@ricambicentrosud.com>',
    to: email,
    subject: "Password Reset",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Password Reset</h2>
        <p>We received a request to reset your password.</p>
        <p>Please reset your password by clicking the button below:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #4CAF50; border-radius: 5px; text-decoration: none;">Reset Password</a>
        <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
        <p><a href="${resetUrl}" style="color: #4CAF50;">${resetUrl}</a></p>
        <p>Additionally, please enter the following passcode on the reset password page:</p>
        <p style="font-size: 18px; font-weight: bold; color: #4CAF50;">${passcode}</p>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <p>Thank you!</p>
        <p>Ricambi Centro Sud Team</p>
      </div>
    `,
    text: `Please reset your password by visiting the following link: ${resetUrl} and use the passcode: ${passcode}. If you did not request a password reset, please ignore this email or contact support.`,
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    logger.info("Password reset email sent", { email, resetUrl, response });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to send password reset email", {
        email,
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Failed to send password reset email", {
        email,
        error: String(error),
      });
    }
    throw error;
  }
};
