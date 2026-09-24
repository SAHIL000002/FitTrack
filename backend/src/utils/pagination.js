/**
 * Pagination helper — parses ?page=&limit= query parameters safely.
 * Rules:
 *   default page  = 1
 *   default limit = 10
 *   maximum limit = 100
 *   no page below 1
 *   no limit below 1
 */
export const getPagination = (query = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/** Total pages for a given total record count and limit. */
export const getPages = (total, limit) => (total > 0 ? Math.ceil(total / limit) : 0);