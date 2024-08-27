import { Router } from 'express';
import {
  getContactsController,
  getOneContactController,
  createContactController,
  deleteContactController,
  upsertContactController,
  patchContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/vallidateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
// import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

// router.use('/:contactId', isValidId('contactId'));

router.use(authenticate);

router.get('/', ctrlWrapper(getContactsController));

router.get('/:contactId', ctrlWrapper(getOneContactController));

router.post(
  '/',
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);

router.delete('/:contactId', ctrlWrapper(deleteContactController));

router.put(
  '/:contactId',
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(upsertContactController),
);

router.patch(
  '/:contactId',
  upload.single('photo'),
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController),
);

export default router;
