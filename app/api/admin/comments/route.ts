import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/comments?status=flagged|all
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'flagged'

  let query = supabase
    .from('comments')
    .select(`
      id, story_id, author_name, content, is_flagged, created_at,
      comment_reactions (reaction)
    `)
    .order('created_at', { ascending: false })

  if (status === 'flagged') {
    query = query.eq('is_flagged', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }

  const shaped = (data || []).map((c: any) => ({
    id: c.id,
    story_id: c.story_id,
    author_name: c.author_name,
    content: c.content,
    is_flagged: c.is_flagged,
    created_at: c.created_at,
    likes: (c.comment_reactions || []).filter((r: any) => r.reaction === 'like').length,
    dislikes: (c.comment_reactions || []).filter((r: any) => r.reaction === 'dislike').length,
  }))

  return NextResponse.json({ comments: shaped })
}

// DELETE /api/admin/comments?id=xxx
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabase.from('comments').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// PATCH /api/admin/comments — clear the flag (keep comment, dismiss flag)
export async function PATCH(request: NextRequest) {
  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_flagged: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to clear flag' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
