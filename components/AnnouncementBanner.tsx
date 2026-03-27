'use client'

import { useState, useEffect } from 'react'

const BANNER_KEY = 'dat_comments_banner_dismissed'

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(BANNER_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{ background: "#111827", color: 'white', width: '100%', zIndex: 50 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '999px', padding: '0.15rem 0.6rem', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>
            💬 New
          </span>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <strong style={{ color: 'white', fontWeight: 700 }}>Comments are here.</strong>{' '}
            React to stories and join the conversation.
          </p>
          <a
            href="/stories"
            style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '1px', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Try it →
          </a>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', fontSize: '1rem', lineHeight: 1 }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
