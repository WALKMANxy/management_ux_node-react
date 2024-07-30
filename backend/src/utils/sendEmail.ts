import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtps.aruba.it',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER, // Your Aruba email username
    pass: process.env.SMTP_PASS, // Your Aruba email password
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: '"Ricambi Centro Sud" <ordini.piattaforme@ricambicentrosud.com>', // Your email
    to: email,
    subject: 'Email Verification',
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

  const response = await transporter.sendMail(mailOptions);
  return response;
};
