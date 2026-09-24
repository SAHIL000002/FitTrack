import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";
import { gymSettingsService } from "../services/gymSettingsService.js";

/**
 * GET /api/settings — PUBLIC. Current gym settings for the public website.
 * Internal fields (updatedBy, __v) are stripped. 404 if no settings exist yet
 * (no fake defaults are created automatically).
 */
export const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await gymSettingsService.getCurrentSettings();
  if (!settings) throw new ApiError(404, "Gym settings not found");
  successResponse(
    res,
    gymSettingsService.sanitizeSettings(settings),
    "Gym settings fetched successfully",
  );
});

/**
 * GET /api/settings/manage — OWNER only. Full settings record (includes updatedBy).
 */
export const getSettingsForOwner = asyncHandler(async (req, res) => {
  const settings = await gymSettingsService.getCurrentSettings();
  if (!settings) throw new ApiError(404, "Gym settings not found");
  successResponse(res, settings, "Gym settings fetched successfully");
});

/**
 * PUT /api/settings — OWNER only. Create-or-update the SINGLETON settings doc.
 *  - Values not provided are preserved (merge semantics)
 *  - updatedBy is set from the authenticated owner; client-supplied values are rejected
 */
export const updateSettings = asyncHandler(async (req, res) => {
  // IDOR guard: updatedBy always comes from the JWT, never the request body
  if ("updatedBy" in (req.body || {})) {
    throw new ApiError(
      400,
      "updatedBy is set automatically from the authenticated user",
    );
  }

  const data = gymSettingsService.extractSettingsFields(req.body);
  gymSettingsService.validateSettingsFields(data);

  const { settings, created } = await gymSettingsService.upsertSettings(
    data,
    req.user._id,
  );
  successResponse(
    res,
    settings,
    created
      ? "Gym settings created successfully"
      : "Gym settings updated successfully",
    created ? 201 : 200,
  );
});
