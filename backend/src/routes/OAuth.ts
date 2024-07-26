import { Router, Request, Response } from 'express';
import axios from 'axios';
import { User, IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/auth';

const router = Router();

router.get('/oauth2/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id, email, name, picture } = userInfoResponse.data;

    let user = await User.findOne({ googleId: id });
    if (!user) {
      user = new User({
        googleId: id,
        email,
        name,
        avatar: picture, // Assigning avatar field
        role: 'guest', // Default role
        isEmailVerified: true,
      });
      await user.save();
    } else {
      // Update user details if necessary
      user.googleId = id;
      user.email = email;
      user.avatar = picture; // Updating avatar field
      user.role = 'guest'; // Default role;
      await user.save();
    }

    // Create a JWT token and set it as a cookie or return it to the client
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error during OAuth callback', error);
    res.status(500).send('Authentication failed');
  }
});

export default router;
