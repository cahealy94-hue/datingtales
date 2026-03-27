'use client'

import { useState, useEffect } from 'react'

const BANNER_KEY = 'dat_comments_banner_dismissed'

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.setItem(BANNER_KEY, '1')
    setVisible(false)
  }

  const navigate = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'library' }))
  }

  if (!visible) return null

  return (
    <div
      onClick={navigate}
      style={{
        background: '#EC4899',
        color: 'white',
        width: '100%',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        cursor: 'pointer',
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.55rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '999px',
            padding: '0.15rem 0.55rem',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
            whiteSpace: 'nowrap' as const,
            flexShrink: 0,
          }}>
            💬 New
          </span>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'white',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            <strong style={{ fontWeight: 700 }}>Comments are here.</strong>{' '}
            <span style={{ opacity: 0.9 }}>React to stories and join the conversation.</span>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderBottom: '1.5px solid rgba(255,255,255,0.6)',
            paddingBottom: '1px',
            whiteSpace: 'nowrap' as const,
          }}>
            Try it →
          </span>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              padding: '0.2rem',
              fontSize: '1rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
