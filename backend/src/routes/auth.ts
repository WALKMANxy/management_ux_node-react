import express from 'express';
import passport from '../config/passport';
import { User } from '../models/User';
import sendgrid from '@sendgrid/mail';
import crypto from 'crypto';

const router = express.Router();

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

router.post('/register', async (req, res) => {
  const { email, password, role, ragioneSociale } = req.body;
  try {
    const user = new User({ email, password, role, ragioneSociale });
    const verificationToken = crypto.randomBytes(16).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    const msg = {
      to: email,
      from: 'noreply@yourapp.com',
      subject: 'Email Verification',
      text: `Your verification code is ${verificationToken}`,
    };
    await sendgrid.send(msg);

    res.status(200).json({ message: 'Registration successful, check your email for verification code.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email, verificationToken: code });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).json({ message: 'Login successful.' });
});

export default router;
