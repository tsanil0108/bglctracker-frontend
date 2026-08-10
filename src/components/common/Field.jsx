import React from 'react'

export function FieldWrap({ label, required, error, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-ink-900">
          {label}
          {required && <span className="text-danger"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
}

const baseInput =
  'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-muted/70 focus:border-ink-900 disabled:bg-ink-50 disabled:text-muted'

export function Input({ label, required, error, hint, className = '', ...rest }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} className={className}>
      <input className={`${baseInput} ${error ? 'border-danger' : ''}`} {...rest} />
    </FieldWrap>
  )
}

export function Select({ label, required, error, hint, className = '', children, ...rest }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} className={className}>
      <select className={`${baseInput} ${error ? 'border-danger' : ''}`} {...rest}>
        {children}
      </select>
    </FieldWrap>
  )
}

export function Textarea({ label, required, error, hint, className = '', ...rest }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} className={className}>
      <textarea className={`${baseInput} min-h-[80px]`} {...rest} />
    </FieldWrap>
  )
}
