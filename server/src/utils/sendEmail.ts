import nodemailer from "nodemailer";
import { config } from "../config/config";
import { logger } from "./logger";
import { IpInfo } from "../models/types";

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: parseInt(config.emailHostPort),
  secure: true, // Use SSL
  auth: {
    user: config.smtpUser, // Your Aruba email username
    pass: config.smtpPass, // Your Aruba email password
  },
});

// Helper function to handle and log email errors
function handleEmailError(
  message: string,
  error: unknown,
  context: Record<string, unknown>
) {
  if (error instanceof Error) {
    logger.error(message, {
      ...context,
      error: error.message,
      stack: error.stack,
    });
  } else {
    logger.error(message, {
      ...context,
      error: String(error),
    });
  }
}

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.baseUrl}/auth/verify-email?token=${token}`;
  logger.debug("Preparing to send verification email", {
    email,
    verificationUrl,
  });

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
    logger.info("Verification email sent successfully", {
      email,
      response: response.messageId, // Log only the message ID or minimal details
    });
    return response;
  } catch (error) {
    handleEmailError("Failed to send verification email", error, {
      email,
      verificationUrl,
    });
    throw error; // Re-throw error after logging
  }
};

// Function to send a password reset email with a 6-digit code
export const sendPasswordResetEmail = async (email: string, code: string, ipInfo: IpInfo | null) => {
  logger.debug("Preparing to send password reset email", { email });

  // Format IP information if available
  const ipDetails = ipInfo
    ? `We received a request to reset your password from the IP address: ${ipInfo.ip} (${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}). If this was not you, please ignore this email or contact support.`
    : `We received a request to reset your password. If this was not you, please ignore this email or contact support.`;

  const mailOptions = {
    from: '"Ricambi Centro Sud" <ordini.piattaforme@ricambicentrosud.com>',
    to: email,
    subject: "Password Reset Code",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>${ipDetails}</p>
        <p>Please use the following code to reset your password:</p>
        <p style="font-size: 22px; font-weight: bold; color: #4CAF50; text-align: center;">${code}</p>
        <p>This code is valid for 10 minutes. If you did not request a password reset, please ignore this email or contact support.</p>
        <p>Thank you!</p>
        <p>Ricambi Centro Sud Team</p>
      </div>
    `,
    text: `Password Reset Request: ${ipDetails} Your password reset code is: ${code}. This code is valid for 10 minutes.`,
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    logger.info("Password reset email sent successfully", {
      email,
      response: response.messageId,
    });
    return response;
  } catch (error) {
    logger.error("Failed to send password reset email", {
      error: error instanceof Error ? error.message : String(error),
      email,
    });
    throw error;
  }
};

// Function to send confirmation email for changes (email or password)
export const sendUserChangesConfirmationEmail = async (
  email: string,
  token: string
) => {
  const verificationUrl = `${config.baseUrl}/auth/verify-email?token=${token}`;
  logger.debug("Preparing to send user changes confirmation email", {
    email,
    verificationUrl,
  });

  const mailOptions = {
    from: '"Ricambi Centro Sud" <ordini.piattaforme@ricambicentrosud.com>',
    to: email,
    subject: "Confirm Your Account Changes",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Account Changes Confirmation</h2>
        <p>Your email or password has been changed.</p>
        <p>To continue using your account, please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #4CAF50; border-radius: 5px; text-decoration: none;">Verify Email</a>
        <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
        <p><a href="${verificationUrl}" style="color: #4CAF50;">${verificationUrl}</a></p>
        <p>If you did not request these changes, please contact support immediately.</p>
        <p>Thank you!</p>
        <p>Ricambi Centro Sud Team</p>
      </div>
    `,
    text: `Your email or password has been changed. Please verify your email by clicking the following link: ${verificationUrl}. If you did not request these changes, please contact support immediately.`,
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    logger.info("User changes confirmation email sent successfully", {
      email,
      response: response.messageId,
    });
    return response;
  } catch (error) {
    handleEmailError("Failed to send user changes confirmation email", error, {
      email,
      verificationUrl,
    });
    throw error;
  }
};
