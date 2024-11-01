// src/utils/emailTemplates.ts

export const verificationEmailTemplate = (params: {
  verificationUrl: string;
  senderName: string;
  supportEmail: string;
  productName: string;
}) => {
  const { verificationUrl, senderName, supportEmail, productName } = params;

  const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #4CAF50;">Welcome!</h1>
        <p>Thanks for trying ${productName}. We’re thrilled to have you on board. To be able to access ${productName}, please verify your email address by clicking the button below:</p>
        <!-- Action -->
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
          <tr>
            <td align="center">
              <!-- Button -->
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
            </td>
          </tr>
        </table>
        <p>Thanks,<br>${senderName}</p>
        <!-- Sub copy -->
        <table width="100%" style="border-top: 1px solid #eaeaea; margin-top: 20px; padding-top: 20px;">
          <tr>
            <td>
              <p style="font-size: 12px; color: #999999;">If you’re having trouble with the button above, copy and paste the URL below into your web browser:</p>
              <p style="font-size: 12px; color: #999999;"><a href="${verificationUrl}" style="color: #999999;">${verificationUrl}</a></p>
              <p style="font-size: 12px; color: #999999;">If you need assistance, you can send an email to <a href="mailto:${supportEmail}" style="color: #999999;">${supportEmail}</a>.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

  const textBody = `
  Welcome!

  Thanks for trying ${productName}. We’re thrilled to have you on board. To be able to access ${productName}, please verify your email address by clicking the link below:

  ${verificationUrl}

  Thanks,
  ${senderName}

  If you’re having trouble clicking the "Verify Email" button, copy and paste the URL above into your web browser.

  If you need assistance, you can send an email to ${supportEmail}.
    `;

  return { htmlBody, textBody };
};

export const passwordResetEmailTemplate = (params: {
  code: string;
  ipDetails: string;
  senderName: string;
  supportEmail: string;
}) => {
  const { code, ipDetails, senderName, supportEmail } = params;

  const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #4CAF50;">Hi there,</h1>
        <p>${ipDetails}</p>
        <p>Please use the following code to reset your password:</p>
        <!-- Code -->
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
          <tr>
            <td align="center">
              <p style="font-size: 24px; font-weight: bold; color: #4CAF50; margin: 0;">${code}</p>
            </td>
          </tr>
        </table>
        <p>This code is valid for 10 minutes. If you did not request a password reset, please ignore this email or <a href="mailto:${supportEmail}" style="color: #4CAF50;">contact support</a> if you have questions.</p>
        <p>Thanks,<br>${senderName}</p>
        <!-- Sub copy -->
        <table width="100%" style="border-top: 1px solid #eaeaea; margin-top: 20px; padding-top: 20px;">
          <tr>
            <td>
              <p style="font-size: 12px; color: #999999;">If you need assistance, you can send an email to <a href="mailto:${supportEmail}" style="color: #999999;">${supportEmail}</a>.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

  const textBody = `
  Hi there,

  ${ipDetails}

  Please use the following code to reset your password:

  Password Reset Code: ${code}

  This code is valid for 10 minutes. If you did not request a password reset, please ignore this email or contact support at ${supportEmail} if you have questions.

  Thanks,
  ${senderName}

  If you need assistance, you can send an email to ${supportEmail}.
    `;

  return { htmlBody, textBody };
};

export const userChangesConfirmationEmailTemplate = (params: {
  verificationUrl: string;
  ipDetails: string;
  senderName: string;
  supportEmail: string;
}) => {
  const { verificationUrl, ipDetails, senderName, supportEmail } = params;

  const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #4CAF50;">Account Changes Confirmation</h1>
        <p>Hi there,</p>
        <p>${ipDetails}</p>
        <p>To continue using your account, please verify your email by clicking the button below:</p>
        <!-- Action -->
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
          <tr>
            <td align="center">
              <!-- Button -->
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
            </td>
          </tr>
        </table>
        <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
        <p><a href="${verificationUrl}" style="color: #4CAF50;">${verificationUrl}</a></p>
        <p>If you did not request these changes, please <a href="mailto:${supportEmail}" style="color: #4CAF50;">contact support</a> immediately.</p>
        <p>Thanks,<br>${senderName}</p>
        <!-- Sub copy -->
        <table width="100%" style="border-top: 1px solid #eaeaea; margin-top: 20px; padding-top: 20px;">
          <tr>
            <td>
              <p style="font-size: 12px; color: #999999;">If you need assistance, you can send an email to <a href="mailto:${supportEmail}" style="color: #999999;">${supportEmail}</a>.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

  const textBody = `
  Account Changes Confirmation

  Hi there,

  ${ipDetails}

  To continue using your account, please verify your email by clicking the link below:

  ${verificationUrl}

  If you did not request these changes, please contact support at ${supportEmail} immediately.

  Thanks,
  ${senderName}

  If you need assistance, you can send an email to ${supportEmail}.
    `;

  return { htmlBody, textBody };
};
