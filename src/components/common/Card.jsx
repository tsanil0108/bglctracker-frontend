import React from 'react'

export default function Card({ children, className = '', accent }) {
  return (
    <div className={`relative overflow-hidden rounded-xl2 border border-border bg-white p-5 shadow-card ${className}`}>
      {accent && <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} />}
      {children}
    </div>
  )
}
