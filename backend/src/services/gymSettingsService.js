import GymSettings from '../models/GymSettings.js';
import ApiError from '../utils/ApiError.js';

/**
 * GymSettings service — validation, sanitization and SINGLETON behavior.
 * The GymSettings model (src/models/GymSettings.js) is the source of truth:
 *   gymName, address, phone, email, hours { day: { open, close, isClosed } },
 *   description, logo, socialLinks (Mixed), updatedBy (ref User).
 */

export const SETTINGS_FIELDS = [
  'gymName', 'address', 'phone', 'email', 'hours', 'description', 'logo', 'socialLinks',
];

// Days exactly as defined in the model schema — the structure is NOT reinvented
export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Recognized social link keys (model socialLinks is a free Mixed object, so the
// service limits it to a sane, predictable set of platforms)
export const SOCIAL_KEYS = ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok'];

const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/; // 24h HH:MM
const PHONE_PATTERN = /^[+()\-\s./0-9]{6,20}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const MAX_LENGTHS = {
  gymName: 120,
  address: 300,
  description: 2000,
  logo: 500,
  socialUrl: 300,
};

/** Copy only known GymSettings fields from the request body. */
export const extractSettingsFields = (body) => {
  const data = {};
  for (const field of SETTINGS_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  return data;
};

/** Validate + normalize a single day-hours entry (model: { open, close, isClosed }). */
const validateDayHours = (day, value) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiError(400, `hours.${day} must be an object with open, close and isClosed`);
  }
  const entry = {};
  if (value.open !== undefined) {
    if (typeof value.open !== 'string') throw new ApiError(400, `hours.${day}.open must be a string`);
    entry.open = value.open.trim();
    if (entry.open && !TIME_PATTERN.test(entry.open)) {
      throw new ApiError(400, `hours.${day}.open must be a time in HH:MM (24h) format`);
    }
  }
  if (value.close !== undefined) {
    if (typeof value.close !== 'string') throw new ApiError(400, `hours.${day}.close must be a string`);
    entry.close = value.close.trim();
    if (entry.close && !TIME_PATTERN.test(entry.close)) {
      throw new ApiError(400, `hours.${day}.close must be a time in HH:MM (24h) format`);
    }
  }
  if (value.isClosed !== undefined) {
    if (typeof value.isClosed !== 'boolean') throw new ApiError(400, `hours.${day}.isClosed must be a boolean`);
    entry.isClosed = value.isClosed;
  }
  return entry;
};

export const validateSettingsFields = (data) => {
  // Simple strings
  for (const field of ['gymName', 'address', 'description', 'logo']) {
    if (data[field] != null) {
      if (typeof data[field] !== 'string') throw new ApiError(400, `${field} must be a string`);
      data[field] = data[field].trim();
      if (data[field].length > MAX_LENGTHS[field]) {
        throw new ApiError(400, `${field} must be at most ${MAX_LENGTHS[field]} characters`);
      }
    }
  }

  // Phone — practical format/length check
  if (data.phone != null) {
    if (typeof data.phone !== 'string') throw new ApiError(400, 'Phone must be a string');
    data.phone = data.phone.trim();
    if (data.phone && !PHONE_PATTERN.test(data.phone)) {
      throw new ApiError(400, 'Phone must be a valid phone number (6-20 chars: digits and + ( ) - . space)');
    }
  }

  // Email — valid format if provided (model lowercases + trims)
  if (data.email != null) {
    if (typeof data.email !== 'string') throw new ApiError(400, 'Email must be a string');
    data.email = data.email.trim().toLowerCase();
    if (data.email && !EMAIL_PATTERN.test(data.email)) {
      throw new ApiError(400, 'Email must be a valid email address');
    }
  }

  // Hours — validate the model's exact day structure; only provided days are included
  if (data.hours != null) {
    if (typeof data.hours !== 'object' || data.hours === null || Array.isArray(data.hours)) {
      throw new ApiError(400, 'Hours must be an object keyed by day name');
    }
    const normalized = {};
    for (const key of Object.keys(data.hours)) {
      const day = String(key).toLowerCase();
      if (!DAYS.includes(day)) {
        throw new ApiError(400, `Unknown day in hours: ${key}. Valid days: ${DAYS.join(', ')}`);
      }
      normalized[day] = validateDayHours(day, data.hours[key]);
    }
    data.hours = normalized;
  }

  // Social links — fixed set of keys, string URL values
  if (data.socialLinks != null) {
    if (typeof data.socialLinks !== 'object' || data.socialLinks === null || Array.isArray(data.socialLinks)) {
      throw new ApiError(400, 'Social links must be an object keyed by platform name');
    }
    const normalized = {};
    for (const key of Object.keys(data.socialLinks)) {
      const platform = String(key).toLowerCase();
      if (!SOCIAL_KEYS.includes(platform)) {
        throw new ApiError(400, `Unknown social platform: ${key}. Valid platforms: ${SOCIAL_KEYS.join(', ')}`);
      }
      const url = data.socialLinks[key];
      if (url == null) {
        normalized[platform] = '';
        continue;
      }
      if (typeof url !== 'string') throw new ApiError(400, `Social link ${platform} must be a string URL`);
      const trimmed = url.trim();
      if (trimmed && !/^https?:\/\/\S+$/i.test(trimmed)) {
        throw new ApiError(400, `Social link ${platform} must be a valid http(s) URL`);
      }
      if (trimmed.length > MAX_LENGTHS.socialUrl) {
        throw new ApiError(400, `Social link ${platform} must be at most ${MAX_LENGTHS.socialUrl} characters`);
      }
      normalized[platform] = trimmed;
    }
    data.socialLinks = normalized;
  }
};

/** Current settings record — the FIRST created document acts as the singleton. */
export const getCurrentSettings = async () => GymSettings.findOne().sort({ createdAt: 1 });

/** Public-safe shape — internal fields (updatedBy, __v) are never exposed. */
export const sanitizeSettings = (settings) => {
  if (!settings) return null;
  const obj = typeof settings.toObject === 'function' ? settings.toObject() : settings;
  const { updatedBy, __v, ...safe } = obj;
  return safe;
};

/**
 * Create-or-update the singleton settings document.
 *  - Values not provided are preserved (merge semantics, per-day for hours)
 *  - updatedBy is ALWAYS taken from the authenticated user, never the client
 *  - Never creates a second document (singleton guarantee)
 */
export const upsertSettings = async (data, userId) => {
  let settings = await GymSettings.findOne().sort({ createdAt: 1 });
  let created = false;

  if (!settings) {
    settings = new GymSettings();
    created = true;
  }

  // Merge partial hours updates into the existing days (per-day patch)
  if (data.hours) {
    const existingHours = settings.hours ? settings.hours.toObject() : {};
    settings.hours = { ...existingHours, ...data.hours };
    delete data.hours;
  }

  for (const key of Object.keys(data)) {
    settings[key] = data[key];
  }
  settings.updatedBy = userId;
  await settings.save();

  return { settings, created };
};

export const gymSettingsService = {
  SETTINGS_FIELDS,
  DAYS,
  SOCIAL_KEYS,
  extractSettingsFields,
  validateSettingsFields,
  getCurrentSettings,
  sanitizeSettings,
  upsertSettings,
};

