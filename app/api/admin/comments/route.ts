const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  }
}

// GET /api/admin/comments?status=flagged|all
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "flagged"

  const filter = status === "flagged" ? "&is_flagged=eq.true" : ""
  const commentsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/comments?select=id,story_id,author_name,content,is_flagged,created_at${filter}&order=created_at.desc`,
    { headers: supabaseHeaders() }
  )
  const comments = await commentsRes.json()

  if (!commentsRes.ok) {
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 })
  }

  // Fetch reaction counts
  const commentIds = comments.map(c => c.id)
  let reactions = []
  if (commentIds.length > 0) {
    const reactRes = await fetch(
      `${SUPABASE_URL}/rest/v1/comment_reactions?comment_id=in.(${commentIds.join(",")})&select=comment_id,reaction`,
      { headers: supabaseHeaders() }
    )
    reactions = await reactRes.json()
  }

  const shaped = comments.map(c => ({
    ...c,
    likes: reactions.filter(r => r.comment_id === c.id && r.reaction === "like").length,
    dislikes: reactions.filter(r => r.comment_id === c.id && r.reaction === "dislike").length,
  }))

  return Response.json({ comments: shaped })
}

// DELETE /api/admin/comments?id=xxx
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/comments?id=eq.${id}`,
    { method: "DELETE", headers: supabaseHeaders() }
  )

  if (!res.ok) {
    return Response.json({ error: "Failed to delete comment" }, { status: 500 })
  }

  return Response.json({ success: true })
}

// PATCH /api/admin/comments — clear the flag (keep comment, dismiss flag)
export async function PATCH(request) {
  const { id } = await request.json()

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/comments?id=eq.${id}`,
    {
      method: "PATCH",
      headers: { ...supabaseHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ is_flagged: false }),
    }
  )

  if (!res.ok) {
    return Response.json({ error: "Failed to clear flag" }, { status: 500 })
  }

  return Response.json({ success: true })
}
