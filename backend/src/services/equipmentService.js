import ApiError from '../utils/ApiError.js';

/**
 * Equipment service — field extraction, validation, and public query building.
 * DB access stays in the controller (matches the progressService pattern);
 * this module holds the reusable pure logic.
 *
 * The Equipment model (src/models/Equipment.js) is the source of truth:
 *   name (req), category (enum), description, type, usage, image,
 *   tags [String], quantity (Number, min 0), condition (enum), isActive.
 */

export const EQUIPMENT_FIELDS = [
  'name', 'category', 'description', 'type', 'usage', 'image', 'tags', 'quantity', 'condition',
];

export const EQUIPMENT_CATEGORIES = ['STRENGTH', 'MACHINES', 'CONDITIONING', 'FUNCTIONAL'];
export const EQUIPMENT_CONDITIONS = ['EXCELLENT', 'GOOD', 'MAINTENANCE', 'OUT_OF_SERVICE'];

// Practical length caps (model has no maxlength — enforced here for sanity)
const MAX_LENGTHS = {
  name: 120,
  description: 2000,
  type: 120,
  usage: 500,
  image: 500,
  tag: 40,
};

const MAX_TAGS = 20;

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Copy only known Equipment fields from the request body — never arbitrary fields. */
export const extractEquipmentFields = (body) => {
  const data = {};
  for (const field of EQUIPMENT_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  return data;
};

/**
 * Validate + normalize the extracted fields.
 * isUpdate=true relaxes "required" checks (PATCH semantics) but still validates
 * the shape of every field actually provided.
 */
export const validateEquipmentFields = (data, isUpdate = false) => {
  // Name — required on create (model: required)
  if (data.name != null) {
    if (typeof data.name !== 'string') throw new ApiError(400, 'Name must be a string');
    data.name = data.name.trim();
    if (data.name.length < 2 || data.name.length > MAX_LENGTHS.name) {
      throw new ApiError(400, `Name must be between 2 and ${MAX_LENGTHS.name} characters`);
    }
  } else if (!isUpdate) {
    throw new ApiError(400, 'Equipment name is required');
  }

  // Category — required on create, validated against the model enum
  if (data.category != null) {
    if (typeof data.category !== 'string') throw new ApiError(400, 'Category must be a string');
    data.category = data.category.trim().toUpperCase();
    if (!EQUIPMENT_CATEGORIES.includes(data.category)) {
      throw new ApiError(400, `Category must be one of: ${EQUIPMENT_CATEGORIES.join(', ')}`);
    }
  } else if (!isUpdate) {
    throw new ApiError(400, 'Equipment category is required');
  }

  // Condition — optional, validated against the model enum
  if (data.condition != null) {
    if (typeof data.condition !== 'string') throw new ApiError(400, 'Condition must be a string');
    data.condition = data.condition.trim().toUpperCase();
    if (!EQUIPMENT_CONDITIONS.includes(data.condition)) {
      throw new ApiError(400, `Condition must be one of: ${EQUIPMENT_CONDITIONS.join(', ')}`);
    }
  }

  // Free-text string fields
  for (const field of ['description', 'type', 'usage', 'image']) {
    if (data[field] != null) {
      if (typeof data[field] !== 'string') throw new ApiError(400, `${field} must be a string`);
      data[field] = data[field].trim();
      if (data[field].length > MAX_LENGTHS[field]) {
        throw new ApiError(400, `${field} must be at most ${MAX_LENGTHS[field]} characters`);
      }
    }
  }

  // Tags — array of trimmed non-empty strings
  if (data.tags != null) {
    if (!Array.isArray(data.tags)) throw new ApiError(400, 'Tags must be an array of strings');
    if (data.tags.length > MAX_TAGS) throw new ApiError(400, `Tags must contain at most ${MAX_TAGS} items`);
    const cleaned = data.tags
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
    for (const tag of cleaned) {
      if (tag.length > MAX_LENGTHS.tag) {
        throw new ApiError(400, `Each tag must be at most ${MAX_LENGTHS.tag} characters`);
      }
    }
    data.tags = cleaned;
  }

  // Quantity — integer >= 0 (model: min 0)
  if (data.quantity != null) {
    if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity) || data.quantity < 0) {
      throw new ApiError(400, 'Quantity must be an integer greater than or equal to 0');
    }
  }
};

/**
 * Build the public list query. Only ACTIVE equipment is ever returned publicly.
 * Supported filters: category, condition, type, search (+ page/limit via getPagination).
 */
export const buildPublicQuery = (filters = {}) => {
  const query = {};
  if (filters.all !== 'true' && filters.includeInactive !== 'true') {
    query.isActive = true;
  }

  if (filters.category) {
    const category = String(filters.category).trim().toUpperCase();
    if (!EQUIPMENT_CATEGORIES.includes(category)) {
      throw new ApiError(400, `Category must be one of: ${EQUIPMENT_CATEGORIES.join(', ')}`);
    }
    query.category = category;
  }

  if (filters.condition) {
    const condition = String(filters.condition).trim().toUpperCase();
    if (!EQUIPMENT_CONDITIONS.includes(condition)) {
      throw new ApiError(400, `Condition must be one of: ${EQUIPMENT_CONDITIONS.join(', ')}`);
    }
    query.condition = condition;
  }

  // type is a free-text field — exact match, case-insensitive
  if (filters.type) {
    query.type = { $regex: `^${escapeRegex(String(filters.type).trim())}$`, $options: 'i' };
  }

  // search — case-insensitive across name, description, type, usage and tags
  if (filters.search) {
    const pattern = new RegExp(escapeRegex(String(filters.search).trim()), 'i');
    query.$or = [
      { name: pattern },
      { description: pattern },
      { type: pattern },
      { usage: pattern },
      { tags: pattern },
    ];
  }

  return query;
};

export const equipmentService = {
  EQUIPMENT_FIELDS,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  extractEquipmentFields,
  validateEquipmentFields,
  buildPublicQuery,
};
