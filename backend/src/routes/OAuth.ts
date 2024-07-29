import { Router, Request, Response } from 'express';
import axios from 'axios';
import { User, IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/auth';

const router = Router();

const getToken = async (code: string) => {
  return axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URI,
    grant_type: 'authorization_code',
  });
};

const getUserInfo = async (accessToken: string) => {
  return axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

const findOrCreateUser = async (googleId: string, email: string, name: string, picture: string) => {
  let user = await User.findOne({ googleId });
  if (!user) {
    user = new User({
      googleId,
      email,
      name,
      avatar: picture,
      role: 'guest',
      isEmailVerified: true,
    });
    await user.save();
  } else {
    user.googleId = googleId;
    user.email = email;
    user.avatar = picture;
    user.role = 'guest';
    await user.save();
  }
  return user;
};

router.get('/oauth2/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    const tokenResponse = await getToken(code as string);
    const { access_token } = tokenResponse.data;

    const userInfoResponse = await getUserInfo(access_token);
    const { id, email, name, picture } = userInfoResponse.data;

    const user = await findOrCreateUser(id, email, name, picture);

    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.redirect(process.env.CLIENT_REDIRECT_URI || '/dashboard');
  } catch (error) {
    console.error('Error during OAuth callback', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data);
    }
    res.status(500).send('Authentication failed');
  }
});

export default router;
