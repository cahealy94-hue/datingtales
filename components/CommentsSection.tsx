'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
  likes: number
  dislikes: number
  my_reaction: 'like' | 'dislike' | null
}

interface CommentsSectionProps {
  storyId: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getOrCreateSessionId(): string {
  const key = 'dat_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(key, id)
  }
  return id
}

function CommentCard({ comment, sessionId, onReactionChange }: {
  comment: Comment
  sessionId: string
  onReactionChange: (id: string, likes: number, dislikes: number, my_reaction: 'like' | 'dislike' | null) => void
}) {
  const [reacting, setReacting] = useState(false)

  const react = async (reaction: 'like' | 'dislike') => {
    if (reacting) return
    setReacting(true)
    const newReaction = comment.my_reaction === reaction ? null : reaction
    const delta = (type: 'like' | 'dislike') => {
      let count = type === 'like' ? comment.likes : comment.dislikes
      if (comment.my_reaction === type) count--
      if (newReaction === type) count++
      return Math.max(0, count)
    }
    onReactionChange(comment.id, delta('like'), delta('dislike'), newReaction)
    try {
      const res = await fetch('/api/comments/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: comment.id, session_id: sessionId, reaction: newReaction }),
      })
      const data = await res.json()
      if (res.ok) onReactionChange(comment.id, data.likes, data.dislikes, data.my_reaction)
    } catch (err) {
      console.error('Reaction failed', err)
    } finally {
      setReacting(false)
    }
  }

  return (
    <div style={{ padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{comment.author_name}</span>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{timeAgo(comment.created_at)}</span>
      </div>
      <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.6, margin: '0 0 0.6rem' }}>{comment.content}</p>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button
          onClick={() => react('like')}
          disabled={reacting}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.55rem', borderRadius: '999px',
            border: comment.my_reaction === 'like' ? '1px solid #2563eb' : '1px solid #e5e7eb',
            background: comment.my_reaction === 'like' ? '#eff6ff' : 'white',
            color: comment.my_reaction === 'like' ? '#2563eb' : '#6b7280',
            fontSize: '0.78rem', fontWeight: 500, cursor: reacting ? 'not-allowed' : 'pointer',
            opacity: reacting ? 0.6 : 1, fontFamily: 'inherit',
          }}
        >
          👍 {comment.likes > 0 && comment.likes}
        </button>
        <button
          onClick={() => react('dislike')}
          disabled={reacting}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.55rem', borderRadius: '999px',
            border: comment.my_reaction === 'dislike' ? '1px solid #e11d48' : '1px solid #e5e7eb',
            background: comment.my_reaction === 'dislike' ? '#fff1f2' : 'white',
            color: comment.my_reaction === 'dislike' ? '#e11d48' : '#6b7280',
            fontSize: '0.78rem', fontWeight: 500, cursor: reacting ? 'not-allowed' : 'pointer',
            opacity: reacting ? 0.6 : 1, fontFamily: 'inherit',
          }}
        >
          👎 {comment.dislikes > 0 && comment.dislikes}
        </button>
      </div>
    </div>
  )
}

export default function CommentsSection({ storyId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const sessionIdRef = useRef<string>('')

  const fetchComments = useCallback(async () => {
    try {
      const sid = sessionIdRef.current || ''
      const res = await fetch(`/api/comments?story_id=${storyId}&session_id=${sid}`)
      const data = await res.json()
      if (res.ok) setComments(data.comments || [])
    } catch (err) {
      console.error('Failed to load comments', err)
    } finally {
      setLoading(false)
    }
  }, [storyId])

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId()
    fetchComments()
  }, [fetchComments])

  const handleReactionChange = (id: string, likes: number, dislikes: number, my_reaction: 'like' | 'dislike' | null) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, likes, dislikes, my_reaction } : c))
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: storyId,
          author_name: 'Anonymous',
          content: content.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      setComments(prev => [...prev, data.comment])
      setSubmitted(true)
      setContent('')
      setTimeout(() => setSubmitted(false), 4000)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'inherit', fontSize: '1.1rem', fontWeight: 600, color: '#111827', margin: 0 }}>
          💬 {loading ? 'Comments' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
        </h3>
      </div>

      <div>
        {loading ? (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading…</p>
        ) : comments.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>No comments yet. Be the first to share your thoughts.</p>
        ) : (
          comments.map(c => (
            <CommentCard
              key={c.id}
              comment={c}
              sessionId={sessionIdRef.current}
              onReactionChange={handleReactionChange}
            />
          ))
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {submitted ? (
          <div style={{ padding: '0.85rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '0.9rem' }}>
            ✓ Comment posted!
          </div>
        ) : (
          <>
            
            <textarea
              placeholder="Share your reaction or story…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
              maxLength={1000}
              style={{
                width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
                color: '#111827', background: '#fafafa', boxSizing: 'border-box', resize: 'vertical',
              }}
            />
            {error && <p style={{ fontSize: '0.85rem', color: '#dc2626', margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{content.length}/1000</span>
              <button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                style={{
                  background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '0.55rem 1.1rem', fontSize: '0.875rem', fontWeight: 600,
                  fontFamily: 'inherit', cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
                  opacity: submitting || !content.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
