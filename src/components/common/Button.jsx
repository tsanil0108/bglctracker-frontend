import React from 'react'

const VARIANTS = {
  primary: 'bg-ink-900 text-white hover:bg-ink-700 disabled:bg-ink-100 disabled:text-muted',
  accent: 'bg-bg-600 text-white hover:bg-bg-700 disabled:opacity-50',
  outline: 'border border-border bg-white text-ink-900 hover:bg-ink-50',
  ghost: 'text-ink-900 hover:bg-ink-50',
  danger: 'bg-danger text-white hover:bg-red-800 disabled:opacity-50',
}

const SIZES = {
  sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-3.5 py-2 rounded-lg gap-2',
  lg: 'text-sm px-5 py-2.5 rounded-xl gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150 whitespace-nowrap disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
