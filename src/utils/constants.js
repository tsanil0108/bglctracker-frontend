export const FD_STATUS = {
  OPEN: 'OPEN',
  LIEN_MARKED: 'LIEN_MARKED',
  CLOSED: 'CLOSED',
}

export const INSTRUMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
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
}

export const STATUS_LABELS = {
  ACTIVE: 'Active',
  OPEN: 'Open',
  LIEN_MARKED: 'Lien-Marked',
  EXPIRED: 'Expired',
  CLOSED: 'Closed',
}
