import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/vallidateBody.js';
import {
  registerUserSchema,
  loginUserSchema,
  sendResetEmailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshUsersSessionsController,
  requestResetEmailController,
  resetPasswordController,
} from '../controllers/auth.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

router.post('/logout', ctrlWrapper(logoutUserController));

router.post('/refresh', ctrlWrapper(refreshUsersSessionsController));

router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

export default router;
