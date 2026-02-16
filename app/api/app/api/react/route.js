const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";

export async function POST(request) {
  const { storyId, emoji, action } = await request.json();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!storyId || !emoji || !action) {
    return Response.json({ error: "Missing storyId, emoji, or action" }, { status: 400 });
  }

  // Fetch current reactions
  const getRes = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}&select=reactions`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );
  const rows = await getRes.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return Response.json({ error: "Story not found" }, { status: 404 });
  }

  const reactions = rows[0].reactions || {};
  if (action === "add") {
    reactions[emoji] = (reactions[emoji] || 0) + 1;
  } else if (action === "remove") {
    reactions[emoji] = (reactions[emoji] || 0) - 1;
    if (reactions[emoji] <= 0) delete reactions[emoji];
  }

  // Save updated reactions
  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ reactions }),
    }
  );

  if (!updateRes.ok) {
    return Response.json({ error: "Failed to update reactions" }, { status: 500 });
  }

  return Response.json({ ok: true, reactions });
}
