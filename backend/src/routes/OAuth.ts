import { Router, Request, Response } from 'express';
import axios from 'axios';
import { User, IUser } from '../models/User';
import { authenticateUser, generateToken } from '../utils/authentication';
import { AuthenticatedRequest } from '../models/types';
import {config} from '../config/config';

const router = Router();

const getToken = async (code: string) => {
  return axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: config.redirectUri,
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
    res.cookie('token', token, { httpOnly: true, secure: true });

    // Determine the redirection path based on the user role
    let redirectUrl = '/';
    if (user.role === 'admin') {
      redirectUrl = '/admin-dashboard';
    } else if (user.role === 'agent') {
      redirectUrl = '/agent-dashboard';
    } else if (user.role === 'client') {
      redirectUrl = '/client-dashboard';
    }

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error during OAuth callback', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data);
    }
    res.status(500).send('Authentication failed');
  }
});

router.use(authenticateUser);

router.get('/link-google', async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.query;
  const user = req.user as IUser;

  try {
    const tokenResponse = await getToken(code as string);
    const { access_token } = tokenResponse.data;

    const userInfoResponse = await getUserInfo(access_token);
    const { id, email, name, picture } = userInfoResponse.data;

    if (email !== user.email) {
      return res.status(400).json({ message: 'The email associated with this Google account does not match the email of the current user' });
    }

    user.googleId = id;
    user.avatar = picture; // Optionally update avatar
    await user.save();

    res.status(200).json({ message: 'Google account linked successfully', user });
  } catch (error) {
    console.error('Error during Google account linking', error);
    res.status(500).json({ message: 'Failed to link Google account', error });
  }
});

export default router;
