import { Router } from 'express';
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  deleteContactController,
  upsertContactController,
  patchContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { validateBody } from '../middlewares/vallidateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { isUser } from '../middlewares/isUser.js';

const router = Router();

router.use('/:contactId', isValidId('contactId'));

router.use(authenticate);

router.get('/', isUser, ctrlWrapper(getContactsController));

router.get('/:contactId', isUser, ctrlWrapper(getContactByIdController));

router.post(
  '/', isUser,
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);

router.delete('/:contactId', isUser, ctrlWrapper(deleteContactController));

router.put(
  '/:contactId',
  validateBody(createContactSchema),
  ctrlWrapper(upsertContactController), isUser,
);

router.patch(
  '/:contactId',
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController), isUser,
);

export default router;
