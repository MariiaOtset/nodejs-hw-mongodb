import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { FIFTEEN_MINUTES, THIRTY_DAYS, SMTP } from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendEmail.js';
import { TEMPLATES_DIR } from '../constants/index.js';

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (!user) throw createHttpError(404, 'User not found');

  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) throw createHttpError(401, 'Unautorized');

  const newSession = createSession();

  await SessionsCollection.deleteOne({ userId: user._id });

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) throw createHttpError(401, 'Session is not found');

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired)
    throw createHttpError(401, 'Session token has expired');

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const requestResetToken = async (email) => {
  try {
    const user = await UsersCollection.findOne({ email });

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const resetToken = jwt.sign(
      {
        sub: user._id,
        email,
      },
      env('JWT_SECRET'),
      {
        expiresIn: '5m',
      },
    );

    const resetPasswordTemplatePath = path.join(
      TEMPLATES_DIR,
      'reset-password-email.html',
    );

    const templateSource = (
      await fs.readFile(resetPasswordTemplatePath)
    ).toString();

    const template = handlebars.compile(templateSource);

    const html = template({
      name: user.name,
      link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
    });

    await sendEmail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    console.log(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, env('JWT_SECRET'));
  } catch (error) {
    if (error instanceof Error)
      throw createHttpError(401, 'Token is expired or invalid.');
    throw error;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) createHttpError(404, 'User not found');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );

  await SessionsCollection.deleteOne({ userId: user._id });
};
