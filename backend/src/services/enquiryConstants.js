/**
 * Enquiry constants — enums and service-level constants.
 * Imported by enquiryService.js and enquiryController.js.
 */

/** Enquiry types supported by the existing Enquiry model. */
export const EnquiryTypes = ['MEMBERSHIP', 'PERSONAL_TRAINING', 'PROGRAMS', 'GENERAL_QUESTION'];

/** Enquiry statuses supported by the existing Enquiry model. */
export const EnquiryStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

/** Preferred contact channels supported by the existing Enquiry model. */
export const PreferredContact = ['EMAIL', 'PHONE'];

/** Holds no telephone field constant for backwards compatibility where needed. */
export const NO_TELEPHONE = true;
