const parseContactType = (contactType) => {
  if (
    typeof contactType === 'string' &&
    ['work', 'home', 'personal'].includes(contactType)
  ) {
    return contactType;
  }
  return null;
};

const parseisFavorite = (isFavorite) => {
  const isString = typeof isFavorite === 'string';

  if (!isString) return null;

  if (isFavorite !== 'true' && isFavorite !== 'false') return null;

  return isFavorite === 'true' ? true : false;
};

export const parseFilterParams = (query) => {
  const { contactType, isFavorite } = query;

  const parsedContactType = parseContactType(contactType);
  const parsedisFavorite = parseisFavorite(isFavorite);

  return {
    contactType: parsedContactType,
    isFavorite: parsedisFavorite,
  };
};
