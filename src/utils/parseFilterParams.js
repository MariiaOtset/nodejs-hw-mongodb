const parseContactType = (contactType) => {
  if (
    typeof contactType === 'string' &&
    ['work', 'home', 'personal'].includes(contactType)
  ) {
    return contactType;
  }
  return null;
};

const parseIsFavourite = (isFavourite) => {
  const isString = typeof isFavourite === 'string';

  if (!isString) return null;

  if (isFavourite !== 'true' && isFavourite !== 'false') return null;

  return isFavourite === 'true' ? true : false;
};

export const parseFilterParams = (query) => {
  const { contactType, isFavourite } = query;

  const parsedContactType = parseContactType(contactType);
  const parsedIsFavourite = parseIsFavourite(isFavourite);

  return {
    contactType: parsedContactType,
    isFavourite: parsedIsFavourite,
  };
};
