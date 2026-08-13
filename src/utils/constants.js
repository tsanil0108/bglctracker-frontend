export const FD_STATUS = {
  OPEN: 'OPEN',
  LIEN_MARKED: 'LIEN_MARKED',
  CLOSED: 'CLOSED',
}

export const INSTRUMENT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  RELEASE_REQUESTED: 'RELEASE_REQUESTED',
  RELEASED: 'RELEASED',
  INVOKED: 'INVOKED',
  CLOSED: 'CLOSED',
}

export const LC_PERIOD_TYPE = {
  CREATION: 'CREATION',
  AT_SIGHT: 'AT_SIGHT',
}

export const GUARANTEE_TYPE_CODE = {
  PBG: 'PBG',
  ABG: 'ABG',
  CBG: 'CBG',
}

export const GUARANTEE_TYPE_LABELS = {
  PBG: 'Performance Bank Guarantee',
  ABG: 'Advance Bank Guarantee',
  CBG: 'Composite / Custom Bank Guarantee',
}

export const STATUS_STYLES = {
  ACTIVE: 'bg-bg-50 text-bg-700 ring-1 ring-inset ring-bg-100',
  OPEN: 'bg-bg-50 text-bg-700 ring-1 ring-inset ring-bg-100',
  LIEN_MARKED: 'bg-fd-50 text-fd-700 ring-1 ring-inset ring-fd-100',
  EXPIRED: 'bg-danger-50 text-danger ring-1 ring-inset ring-red-100',
  CLOSED: 'bg-ink-50 text-muted ring-1 ring-inset ring-border',
  DRAFT: 'bg-ink-50 text-muted ring-1 ring-inset ring-border',
  RELEASE_REQUESTED: 'bg-fd-50 text-fd-700 ring-1 ring-inset ring-fd-100',
  RELEASED: 'bg-bg-50 text-bg-700 ring-1 ring-inset ring-bg-100',
  INVOKED: 'bg-danger-50 text-danger ring-1 ring-inset ring-red-100',
}

export const STATUS_LABELS = {
  ACTIVE: 'Active',
  OPEN: 'Open',
  LIEN_MARKED: 'Lien-Marked',
  EXPIRED: 'Expired',
  CLOSED: 'Closed',
  DRAFT: 'Draft',
  RELEASE_REQUESTED: 'Release Requested',
  RELEASED: 'Released',
  INVOKED: 'Invoked',
}

// NEW — Feature 1
export const AMENDMENT_TYPES = {
  EXTENSION: 'Extension',
  AMOUNT_INCREASE: 'Amount Increase',
  AMOUNT_DECREASE: 'Amount Decrease',
  CLAIM_PERIOD_CHANGE: 'Claim Period Change',
  BENEFICIARY_CHANGE: 'Beneficiary Change',
  OTHER: 'Other',
}

// NEW — Feature 3
export const BG_LIFECYCLE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  RELEASE_REQUESTED: 'RELEASE_REQUESTED',
  RELEASED: 'RELEASED',
  INVOKED: 'INVOKED',
  CLOSED: 'CLOSED',
}

// NEW — Feature 4
export const BG_DOCUMENT_TYPES = [
  'Original BG', 'Amendment', 'Extension Letter', 'Bank Advice',
  'Release Letter', 'Invocation Letter', 'Other',
]

// NEW — Feature 2
export const EXPIRY_INDICATOR_STYLES = {
  GREEN: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  YELLOW: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-100',
  ORANGE: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100',
  RED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-100',
  OVERDUE: 'bg-ink-900 text-white',
}

// NEW — Feature 5
export const FACILITY_TYPES = {
  BG: 'Bank Guarantee',
  LC: 'Letter of Credit',
  OTHER_NON_FUND: 'Other Non-Fund Facility',
}

// NEW — Feature 6
export const ALERT_SEVERITY_STYLES = {
  CRITICAL: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-100',
  WARNING: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100',
  INFO: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100',
}

export const ALERT_MODULE_ROUTES = {
  BG: (id) => `/bg/${id}`,
  LC: () => `/lc`,
  FD: () => `/fd`,
  BANK_LIMIT: () => `/bank-limits`,
}

// NEW — Feature 7
export const AUDIT_ACTION_LABELS = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  STATUS_CHANGE: 'Status Changed',
  AMENDMENT: 'Amendment',
  RELEASE: 'Released',
  CLOSURE: 'Closed',
  DOCUMENT_UPLOAD: 'Document Uploaded',
  DOCUMENT_DELETE: 'Document Deleted',
  FD_LINK: 'FD Linked',
  FD_UNLINK: 'FD Unlinked',
}
// NEW — Phase 3: LC Amendment
export const LC_AMENDMENT_TYPES = {
  AMOUNT_INCREASE: 'Amount Increase',
  AMOUNT_DECREASE: 'Amount Decrease',
  EXPIRY_EXTENSION: 'Expiry Extension',
  VENDOR_CHANGE: 'Vendor Change',
  BANK_CHANGE: 'Bank Change',
  OTHER_CONDITIONS: 'Other Conditions',
  OTHER: 'Other',
}

// NEW — Phase 3: LC Utilization
export const DOCUMENT_STATUS_OPTIONS = {
  PENDING: 'Pending',
  RECEIVED: 'Received',
  ACCEPTED: 'Accepted',
  DISCREPANT: 'Discrepant',
}

export const PAYMENT_STATUS_OPTIONS = {
  PENDING: 'Pending',
  DUE: 'Due',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
}
