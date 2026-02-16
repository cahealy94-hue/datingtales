const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";

export async function PATCH(request) {
  const { storyId, rewritten_text } = await request.json();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!storyId || !rewritten_text) {
    return Response.json({ error: "Missing storyId or text" }, { status: 400 });
  }

  // Only allow editing pending stories (not published, approved, etc.)
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}&status=eq.pending&select=id`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );
  const found = await checkRes.json();
  if (!Array.isArray(found) || found.length === 0) {
    return Response.json({ error: "Story not found or not editable" }, { status: 404 });
  }

  // Update the rewritten text and reset to pending for re-review
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ rewritten_text, status: "pending" }),
    }
  );

  return Response.json({ ok: res.ok });
}
