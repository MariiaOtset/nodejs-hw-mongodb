import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = 'name',
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = perPage * (page - 1);

  const contactsQuery = ContactsCollection.find({ userId });

  if (filter.contactType) {
    contactsQuery.where('contactType').eq(filter.contactType);
  }

  if (filter.isFavorite) {
    contactsQuery.where('isFavorite').eq(filter.isFavorite);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getOneContact = (filters) => ContactsCollection.findOne(filters);

export const postContact = (contactData) =>
  ContactsCollection.create(contactData);

export const deleteContact = (filters) =>
  ContactsCollection.findOneAndDelete(filters);

export const updateContact = async (filters, payload, options = {}) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

const updateContact = (filter, payload) =>
  Contact.findOneAndUpdate(filter, payload, { new: true });
///
