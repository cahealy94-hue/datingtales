'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MessageCircle, Send, Loader2, Clock, ThumbsUp, ThumbsDown } from 'lucide-react'

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

    // Toggle off if same reaction
    const newReaction = comment.my_reaction === reaction ? null : reaction

    // Optimistic update
    const delta = (type: 'like' | 'dislike') => {
      let count = type === 'like' ? comment.likes : comment.dislikes
      if (comment.my_reaction === type) count-- // removing old
      if (newReaction === type) count++           // adding new
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
      if (res.ok) {
        onReactionChange(comment.id, data.likes, data.dislikes, data.my_reaction)
      }
    } catch (err) {
      console.error('Reaction failed', err)
    } finally {
      setReacting(false)
    }
  }

  return (
    <div className="comment-card">
      <div className="comment-meta">
        <span className="comment-author">{comment.author_name}</span>
        <span className="comment-time">
          <Clock size={11} strokeWidth={1.5} />
          {timeAgo(comment.created_at)}
        </span>
      </div>
      <p className="comment-content">{comment.content}</p>
      <div className="comment-reactions">
        <button
          className={`reaction-btn ${comment.my_reaction === 'like' ? 'active-like' : ''}`}
          onClick={() => react('like')}
          disabled={reacting}
          aria-label="Like"
        >
          <ThumbsUp size={13} strokeWidth={2} />
          {comment.likes > 0 && <span>{comment.likes}</span>}
        </button>
        <button
          className={`reaction-btn ${comment.my_reaction === 'dislike' ? 'active-dislike' : ''}`}
          onClick={() => react('dislike')}
          disabled={reacting}
          aria-label="Dislike"
        >
          <ThumbsDown size={13} strokeWidth={2} />
          {comment.dislikes > 0 && <span>{comment.dislikes}</span>}
        </button>
      </div>

      <style jsx>{`
        .comment-card {
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .comment-card:last-child { border-bottom: none; }

        .comment-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.35rem;
        }
        .comment-author {
          font-size: 0.85rem;
          font-weight: 600;
          color: #111827;
        }
        .comment-time {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .comment-content {
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.6;
          margin: 0 0 0.6rem;
        }
        .comment-reactions {
          display: flex;
          gap: 0.4rem;
        }
        .reaction-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.55rem;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #6b7280;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .reaction-btn:hover:not(:disabled) {
          border-color: #d1d5db;
          background: #f9fafb;
        }
        .reaction-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .reaction-btn.active-like {
          background: #eff6ff;
          border-color: #2563eb;
          color: #2563eb;
        }
        .reaction-btn.active-dislike {
          background: #fff1f2;
          border-color: #e11d48;
          color: #e11d48;
        }
      `}</style>
    </div>
  )
}

export default function CommentsSection({ storyId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const sessionIdRef = useRef<string>('')

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId()
  }, [])

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

  const handleReactionChange = (
    id: string,
    likes: number,
    dislikes: number,
    my_reaction: 'like' | 'dislike' | null
  ) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes, dislikes, my_reaction } : c))
    )
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
          author_name: authorName.trim() || 'Anonymous',
          content: content.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      setComments((prev) => [...prev, data.comment])
      setSubmitted(true)
      setAuthorName('')
      setContent('')
      setTimeout(() => setSubmitted(false), 4000)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="comments-section">
      <div className="comments-header">
        <MessageCircle size={18} strokeWidth={1.8} />
        <h3>
          {loading ? 'Comments' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
        </h3>
      </div>

      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">
            <Loader2 size={18} className="spin" />
            <span>Loading…</span>
          </div>
        ) : comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              sessionId={sessionIdRef.current}
              onReactionChange={handleReactionChange}
            />
          ))
        )}
      </div>

      <div className="comment-form">
        {submitted ? (
          <div className="comment-submitted">✓ Comment posted!</div>
        ) : (
          <>
            <input
              type="text"
              className="comment-input"
              placeholder="Your name (optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={50}
            />
            <textarea
              className="comment-textarea"
              placeholder="Share your reaction or story…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            {error && <p className="comment-error">{error}</p>}
            <div className="comment-form-footer">
              <span className="comment-char-count">{content.length}/1000</span>
              <button
                className="comment-submit"
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
              >
                {submitting ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .comments-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }
        .comments-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #111827;
          margin-bottom: 1.25rem;
        }
        .comments-header h3 {
          font-family: 'League Spartan', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }
        .comments-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
          font-size: 0.875rem;
          padding: 1rem 0;
        }
        .comments-empty {
          color: #9ca3af;
          font-size: 0.9rem;
          font-style: italic;
          padding: 0.5rem 0;
        }
        .comment-form {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .comment-input,
        .comment-textarea {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #fafafa;
          box-sizing: border-box;
          transition: border-color 0.15s, background 0.15s;
          resize: vertical;
        }
        .comment-input:focus,
        .comment-textarea:focus {
          outline: none;
          border-color: #2563eb;
          background: #fff;
        }
        .comment-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .comment-char-count {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .comment-submit {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.55rem 1.1rem;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .comment-submit:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
        }
        .comment-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .comment-error {
          font-size: 0.85rem;
          color: #dc2626;
          margin: 0;
        }
        .comment-submitted {
          padding: 0.85rem 1rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          color: #15803d;
          font-size: 0.9rem;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}
