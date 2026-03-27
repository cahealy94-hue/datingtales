import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/comments/react
// Body: { comment_id, session_id, reaction: 'like' | 'dislike' | null }
// Passing null removes the reaction (toggle off)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { comment_id, session_id, reaction } = body

  if (!comment_id || !session_id) {
    return NextResponse.json({ error: 'comment_id and session_id are required' }, { status: 400 })
  }

  if (reaction !== null && reaction !== 'like' && reaction !== 'dislike') {
    return NextResponse.json({ error: 'reaction must be like, dislike, or null' }, { status: 400 })
  }

  // Remove existing reaction first
  await supabase
    .from('comment_reactions')
    .delete()
    .eq('comment_id', comment_id)
    .eq('session_id', session_id)

  // If reaction is null, we're toggling off — we're done
  if (reaction !== null) {
    const { error } = await supabase
      .from('comment_reactions')
      .insert({ comment_id, session_id, reaction })

    if (error) {
      console.error('Error inserting reaction:', error)
      return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 })
    }
  }

  // Return updated counts
  const { data: reactions, error: countError } = await supabase
    .from('comment_reactions')
    .select('reaction')
    .eq('comment_id', comment_id)

  if (countError) {
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 })
  }

  return NextResponse.json({
    likes: reactions.filter((r) => r.reaction === 'like').length,
    dislikes: reactions.filter((r) => r.reaction === 'dislike').length,
    my_reaction: reaction,
  })
}
