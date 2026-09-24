/**
 * Standard FIT TRACK API response helpers.
 * Every endpoint responds through these so the JSON shape stays consistent:
 *   success  -> { success: true,  message, data, [meta] }
 *   list     -> { success: true,  message, data: [], meta: { page, limit, total, pages } }
 *   error    -> { success: false, message, [details] }
 */

/** Single-resource success response. */
export const successResponse = (
  res,
  data = {},
  message = 'Operation successful',
  status = 200
) => res.status(status).json({ success: true, message, data });

/** List success response with pagination meta. */
export const listResponse = (
  res,
  { data = [], page = 1, limit = 10, total = 0, pages = 0, message = 'Records fetched successfully' } = {}
) => res.status(200).json({
  success: true,
  message,
  data,
  meta: { page, limit, total, pages },
});

/** Error response. `details` is only included outside production. */
export const errorResponse = (res, message = 'Something went wrong', status = 500, details = undefined) => {
  const body = { success: false, message };
  if (details !== undefined && process.env.NODE_ENV !== 'production') {
    body.details = details;
  }
  return res.status(status).json(body);
};