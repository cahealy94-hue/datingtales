'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Loader2, RefreshCw, Flag, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react'

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
      setComments((prev) => prev.filter((c) => c.id !== id))
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
      setComments((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="admin-comments">
      <div className="admin-header">
        <div className="admin-header-left">
          <h2>Comments</h2>
          {filter === 'flagged' && comments.length > 0 && (
            <span className="flag-badge">{comments.length} flagged</span>
          )}
        </div>
        <div className="admin-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'flagged' ? 'active' : ''}`}
              onClick={() => setFilter('flagged')}
            >
              <Flag size={12} /> Flagged
            </button>
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
          </div>
          <button className="refresh-btn" onClick={fetchComments} title="Refresh">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <Loader2 size={18} className="spin" /> Loading…
        </div>
      ) : comments.length === 0 ? (
        <div className="admin-empty">
          <CheckCircle size={20} color="#10b981" />
          <span>{filter === 'flagged' ? 'No flagged comments — all clear.' : 'No comments yet.'}</span>
        </div>
      ) : (
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className={`comment-card ${c.is_flagged ? 'is-flagged' : ''}`}>
              <div className="comment-top">
                <div className="comment-meta">
                  {c.is_flagged && (
                    <span className="flag-indicator">
                      <Flag size={11} /> Flagged by AI
                    </span>
                  )}
                  <span className="comment-author">{c.author_name}</span>
                  <span className="comment-story">story {c.story_id.slice(0, 8)}…</span>
                  <span className="comment-date">
                    {new Date(c.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="reaction-counts">
                  <span className="reaction-count like">
                    <ThumbsUp size={12} /> {c.likes}
                  </span>
                  <span className="reaction-count dislike">
                    <ThumbsDown size={12} /> {c.dislikes}
                  </span>
                </div>
              </div>

              <p className="comment-content">{c.content}</p>

              <div className="comment-actions">
                {c.is_flagged && (
                  <button
                    className="action-dismiss"
                    onClick={() => clearFlag(c.id)}
                    disabled={actionId === c.id}
                  >
                    {actionId === c.id ? <Loader2 size={12} className="spin" /> : <CheckCircle size={12} />}
                    Looks fine
                  </button>
                )}
                <button
                  className="action-delete"
                  onClick={() => remove(c.id)}
                  disabled={actionId === c.id}
                >
                  {actionId === c.id ? <Loader2 size={12} className="spin" /> : <Trash2 size={12} />}
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .admin-comments { font-family: 'DM Sans', sans-serif; }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .admin-header h2 {
          font-family: 'League Spartan', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .flag-badge {
          background: #fef3c7;
          color: #d97706;
          border-radius: 999px;
          padding: 0.1rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .admin-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .filter-tabs {
          display: flex;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .filter-tab {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 500;
          background: white;
          border: none;
          cursor: pointer;
          color: #6b7280;
          transition: background 0.1s, color 0.1s;
          font-family: 'DM Sans', sans-serif;
        }
        .filter-tab.active { background: #2563eb; color: white; }
        .refresh-btn {
          background: none;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.35rem 0.5rem;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          transition: background 0.1s;
        }
        .refresh-btn:hover { background: #f9fafb; }

        .admin-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
          padding: 2rem 0;
          font-size: 0.9rem;
        }
        .admin-empty {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          padding: 2rem 0;
          font-size: 0.9rem;
        }

        .comment-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .comment-card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1rem 1.1rem;
          background: white;
        }
        .comment-card.is-flagged {
          border-left: 3px solid #f59e0b;
          background: #fffbeb;
        }

        .comment-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .comment-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .flag-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: #d97706;
          background: #fef3c7;
          border-radius: 999px;
          padding: 0.1rem 0.5rem;
        }
        .comment-author {
          font-size: 0.85rem;
          font-weight: 600;
          color: #111827;
        }
        .comment-story,
        .comment-date {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .reaction-counts {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .reaction-count {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .reaction-count.like { color: #2563eb; }
        .reaction-count.dislike { color: #e11d48; }

        .comment-content {
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.55;
          margin: 0 0 0.75rem;
        }
        .comment-actions {
          display: flex;
          gap: 0.5rem;
        }
        .action-dismiss,
        .action-delete {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.75rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.15s;
        }
        .action-dismiss { background: #f0fdf4; color: #15803d; }
        .action-delete { background: #fee2e2; color: #dc2626; }
        .action-dismiss:disabled,
        .action-delete:disabled { opacity: 0.5; cursor: not-allowed; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
AdminCommentsPanel
