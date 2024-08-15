import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUsersSession,
} from '../services/auth.js';
import { THIRTY_DAYS } from '../constants/index.js';

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + THIRTY_DAYS),
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + THIRTY_DAYS),
    });
  };

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Succesfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  const user = await logoutUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully logged in an user!',
    data: user,
  });
};

export const refreshUsersSessionsController = async (req, res) => {
  const user = await refreshUsersSession(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully logged in an user!',
    data: user,
  });
};
