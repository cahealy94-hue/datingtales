'use client'

import { useState, useEffect, useCallback } from 'react'

interface AdminComment {
  id: string
  story_id: string
  author_name: string
  content: string
  is_flagged: boolean
  created_at: string
  likes: number
  dislikes: number
}

export default function AdminCommentsPanel() {
  const [comments, setComments] = useState<AdminComment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'flagged' | 'all'>('flagged')
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/comments?status=${filter}`)
      const data = await res.json()
      if (res.ok) setComments(data.comments || [])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchComments() }, [fetchComments])

  const remove = async (id: string) => {
    setActionId(id)
    try {
      await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' })
      setComments(prev => prev.filter(c => c.id !== id))
    } finally {
      setActionId(null)
    }
  }

  const clearFlag = async (id: string) => {
    setActionId(id)
    try {
      await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setComments(prev => prev.filter(c => c.id !== id))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>Comments</h2>
          {filter === 'flagged' && comments.length > 0 && (
            <span style={{ background: '#fef3c7', color: '#d97706', borderRadius: '999px', padding: '0.1rem 0.55rem', fontSize: '0.72rem', fontWeight: 600 }}>
              {comments.length} flagged
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {(['flagged', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 500,
                  background: filter === f ? '#2563eb' : 'white',
                  color: filter === f ? 'white' : '#6b7280',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {f === 'flagged' ? '🚩 Flagged' : 'All'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchComments}
            style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading…</p>
      ) : comments.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          {filter === 'flagged' ? '✅ No flagged comments — all clear.' : 'No comments yet.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {comments.map(c => (
            <div
              key={c.id}
              style={{
                border: '1px solid #e5e7eb',
                borderLeft: c.is_flagged ? '3px solid #f59e0b' : '1px solid #e5e7eb',
                borderRadius: '10px', padding: '1rem 1.1rem',
                background: c.is_flagged ? '#fffbeb' : 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {c.is_flagged && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#d97706', background: '#fef3c7', borderRadius: '999px', padding: '0.1rem 0.5rem' }}>
                      🚩 Flagged by AI
                    </span>
                  )}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{c.author_name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>👍 {c.likes}</span>
                  <span style={{ fontSize: '0.75rem', color: '#e11d48' }}>👎 {c.dislikes}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.55, margin: '0 0 0.75rem' }}>{c.content}</p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {c.is_flagged && (
                  <button
                    onClick={() => clearFlag(c.id)}
                    disabled={actionId === c.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem',
                      fontWeight: 600, cursor: actionId === c.id ? 'not-allowed' : 'pointer',
                      border: 'none', background: '#f0fdf4', color: '#15803d',
                      opacity: actionId === c.id ? 0.5 : 1, fontFamily: 'inherit',
                    }}
                  >
                    ✓ Looks fine
                  </button>
                )}
                <button
                  onClick={() => remove(c.id)}
                  disabled={actionId === c.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem',
                    fontWeight: 600, cursor: actionId === c.id ? 'not-allowed' : 'pointer',
                    border: 'none', background: '#fee2e2', color: '#dc2626',
                    opacity: actionId === c.id ? 0.5 : 1, fontFamily: 'inherit',
                  }}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
