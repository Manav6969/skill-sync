/**
 * Encodes createdAt and _id into a Base64 cursor string.
 * @param {Date|string} createdAt 
 * @param {string} id 
 * @returns {string}
 */
export const encodeCursor = (createdAt, id) => {
  const data = JSON.stringify({ t: new Date(createdAt).getTime(), i: id });
  return Buffer.from(data).toString('base64');
};

/**
 * Decodes a Base64 cursor string into timestamp and _id.
 * @param {string} cursor 
 * @returns {{timestamp: Date, id: string} | null}
 */
export const decodeCursor = (cursor) => {
  if (!cursor) return null;
  try {
    const data = JSON.parse(Buffer.from(cursor, 'base64').toString());
    return {
      timestamp: new Date(data.t),
      id: data.i
    };
  } catch (err) {
    console.error('Failed to decode cursor:', err);
    return null;
  }
};