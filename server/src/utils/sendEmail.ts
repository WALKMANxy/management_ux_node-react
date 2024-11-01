// src/utils/sendEmail.ts
import { ServerClient } from "postmark";
import { config } from "../config/config";
import { IpInfo } from "../models/types";
import {
  passwordResetEmailTemplate,
  userChangesConfirmationEmailTemplate,
  verificationEmailTemplate,
} from "./emailTemplates";
import { logger } from "./logger";

// Initialize Postmark client
const postmarkClient = new ServerClient(config.postmarkApiToken);

// Sender details
const senderName = "NEXT_ Team"; // Replace with your company name
const senderEmail = "no-reply@rcsnext.com"; // Verified sender email
const supportEmail = "info@rcsnext.com"; // Contact email
const productName = "NEXT_"; // Replace with your product name

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

// Function to send verification email using Postmark
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.baseUrl}/auth/verify-email?token=${token}`;

  logger.debug("Preparing to send verification email", {
    email,
    verificationUrl,
  });

  try {
    const { htmlBody, textBody } = verificationEmailTemplate({
      verificationUrl,
      senderName,
      supportEmail,
      productName,
    });

    const response = await postmarkClient.sendEmail({
      From: `${senderName} <${senderEmail}>`,
      To: email,
      Subject: `Welcome to ${productName}!`,
      HtmlBody: htmlBody,
      TextBody: textBody,
    });

    logger.info("Verification email sent successfully", {
      email,
      response: response.MessageID,
    });

    return response;
  } catch (error) {
    handleEmailError("Failed to send verification email", error, {
      email,
      verificationUrl,
    });
    throw error;
  }
};

// Function to send password reset email using Postmark
export const sendPasswordResetEmail = async (
  email: string,
  code: string,
  ipInfo: IpInfo | null
) => {
  logger.debug("Preparing to send password reset email", { email });

  const senderName = "NEXT_ Team"; // Replace with your company name
  const supportEmail = "info@rcsnext.com"; // Contact email

  // Format IP information if available
  const ipDetails = ipInfo
    ? `We received a request to reset your password from the IP address: ${ipInfo.ip} (${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}). If this was not you, please ignore this email or contact support.`
    : `We received a request to reset your password. If this was not you, please ignore this email or contact support.`;

  const { htmlBody, textBody } = passwordResetEmailTemplate({
    code,
    ipDetails,
    senderName,
    supportEmail,
  });

  try {
    const response = await postmarkClient.sendEmail({
      From: `${senderName} <${senderEmail}>`,
      To: email,
      Subject: "Reset Your Password",
      HtmlBody: htmlBody,
      TextBody: textBody,
    });

    logger.info("Password reset email sent successfully", {
      email,
      response: response.MessageID,
    });

    return response;
  } catch (error) {
    handleEmailError("Failed to send password reset email", error, {
      email,
    });
    throw error;
  }
};

// Function to send confirmation email for changes using Postmark
export const sendUserChangesConfirmationEmail = async (
  email: string,
  token: string,
  ipInfo: IpInfo | null
) => {
  const verificationUrl = `${config.baseUrl}/auth/verify-email?token=${token}`;
  logger.debug("Preparing to send user changes confirmation email", {
    email,
    verificationUrl,
  });

  const senderName = "NEXT_ Team"; // Replace with your company name
  const supportEmail = "info@rcsnext.com"; // Contact email

  // Format IP information if available
  const ipDetails = ipInfo
    ? `We noticed changes to your account from the IP address: ${ipInfo.ip} (${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}). If this was not you, please contact support immediately.`
    : `We noticed changes to your account. If this was not you, please contact support immediately.`;

  const { htmlBody, textBody } = userChangesConfirmationEmailTemplate({
    verificationUrl,
    ipDetails,
    senderName,
    supportEmail,
  });

  try {
    const response = await postmarkClient.sendEmail({
      From: `${senderName} <${senderEmail}>`,
      To: email,
      Subject: "Confirm Your Account Changes",
      HtmlBody: htmlBody,
      TextBody: textBody,
    });

    logger.info("User changes confirmation email sent successfully", {
      email,
      response: response.MessageID,
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
