const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  }
}

async function moderateComment(content) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 10,
        messages: [{
          role: "user",
          content: `You are a content moderator for a dating stories platform. Flag content as inappropriate if it contains hate speech, explicit sexual content, personal attacks, spam, doxxing, or harassment. Respond with only "FLAG" or "OK".\n\n${content}`
        }],
      }),
    })
    const data = await response.json()
    const verdict = data.content?.[0]?.text?.trim()
    return verdict === "FLAG"
  } catch (err) {
    console.error("Moderation check failed:", err)
    return false
  }
}

// GET /api/comments?story_id=xxx&session_id=yyy
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const storyId = searchParams.get("story_id")
  const sessionId = searchParams.get("session_id") || ""

  if (!storyId) {
    return Response.json({ error: "story_id is required" }, { status: 400 })
  }

  // Fetch approved comments
  const commentsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/comments?story_id=eq.${storyId}&is_approved=eq.true&select=id,author_name,content,created_at&order=created_at.asc`,
    { headers: supabaseHeaders() }
  )
  const comments = await commentsRes.json()

  if (!commentsRes.ok) {
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 })
  }

  // Fetch reactions for these comments
  const commentIds = comments.map(c => c.id)
  let reactions = []
  if (commentIds.length > 0) {
    const reactRes = await fetch(
      `${SUPABASE_URL}/rest/v1/comment_reactions?comment_id=in.(${commentIds.join(",")})&select=comment_id,reaction,session_id`,
      { headers: supabaseHeaders() }
    )
    reactions = await reactRes.json()
  }

  const shaped = comments.map(c => {
    const r = reactions.filter(r => r.comment_id === c.id)
    return {
      ...c,
      likes: r.filter(r => r.reaction === "like").length,
      dislikes: r.filter(r => r.reaction === "dislike").length,
      my_reaction: sessionId ? (r.find(r => r.session_id === sessionId)?.reaction ?? null) : null,
    }
  })

  return Response.json({ comments: shaped })
}

// POST /api/comments
export async function POST(request) {
  const { story_id, author_name, content } = await request.json()

  if (!story_id || !content) {
    return Response.json({ error: "story_id and content are required" }, { status: 400 })
  }
  if (content.trim().length < 3) {
    return Response.json({ error: "Comment is too short" }, { status: 400 })
  }
  if (content.trim().length > 1000) {
    return Response.json({ error: "Comment must be under 1000 characters" }, { status: 400 })
  }

  const isFlagged = await moderateComment(content.trim())

  const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify({
      story_id,
      author_name: author_name?.trim() || "Anonymous",
      content: content.trim(),
      is_approved: true,
      is_flagged: isFlagged,
    }),
  })

  if (!saveRes.ok) {
    console.error("Supabase error:", await saveRes.text())
    return Response.json({ error: "Failed to submit comment" }, { status: 500 })
  }

  const saved = await saveRes.json()
  const comment = Array.isArray(saved) ? saved[0] : saved

  return Response.json(
    { comment: { ...comment, likes: 0, dislikes: 0, my_reaction: null }, message: "Comment posted!" },
    { status: 201 }
  )
}
