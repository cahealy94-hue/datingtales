const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  }
}

// POST /api/comments/react
// Body: { comment_id, session_id, reaction: 'like' | 'dislike' | null }
export async function POST(request) {
  const { comment_id, session_id, reaction } = await request.json()

  if (!comment_id || !session_id) {
    return Response.json({ error: "comment_id and session_id are required" }, { status: 400 })
  }
  if (reaction !== null && reaction !== "like" && reaction !== "dislike") {
    return Response.json({ error: "reaction must be like, dislike, or null" }, { status: 400 })
  }

  // Delete existing reaction for this session + comment
  await fetch(
    `${SUPABASE_URL}/rest/v1/comment_reactions?comment_id=eq.${comment_id}&session_id=eq.${session_id}`,
    { method: "DELETE", headers: supabaseHeaders() }
  )

  // Insert new reaction (unless toggling off)
  if (reaction !== null) {
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/comment_reactions`, {
      method: "POST",
      headers: { ...supabaseHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ comment_id, session_id, reaction }),
    })
    if (!insertRes.ok) {
      console.error("Reaction insert error:", await insertRes.text())
      return Response.json({ error: "Failed to save reaction" }, { status: 500 })
    }
  }

  // Return updated counts
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/comment_reactions?comment_id=eq.${comment_id}&select=reaction`,
    { headers: supabaseHeaders() }
  )
  const reactions = await countRes.json()

  return Response.json({
    likes: reactions.filter(r => r.reaction === "like").length,
    dislikes: reactions.filter(r => r.reaction === "dislike").length,
    my_reaction: reaction,
  })
}
