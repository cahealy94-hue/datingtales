const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";

export async function POST(request) {
  const { userId } = await request.json();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?user_id=eq.${userId}&order=submitted_at.desc&select=id,title,theme,author_persona,rewritten_text,status,reactions,submitted_at,published_at`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!res.ok) {
    console.error("Fetch user stories error:", res.status);
    return Response.json({ error: "Failed to fetch stories" }, { status: 500 });
  }

  const stories = await res.json();
  return Response.json({ ok: true, stories });
}
