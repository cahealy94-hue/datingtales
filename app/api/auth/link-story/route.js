const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";

export async function POST(request) {
  const { storyIds, userId } = await request.json();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!storyIds || !userId || !Array.isArray(storyIds) || storyIds.length === 0) {
    return Response.json({ error: "Missing storyIds or userId" }, { status: 400 });
  }

  // Verify the user exists
  const userCheck = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!userCheck.ok) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Link each story to the user (only if story has no user_id yet)
  let linked = 0;
  for (const storyId of storyIds) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}&user_id=is.null`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );
    if (res.ok) linked++;
  }

  return Response.json({ ok: true, linked });
}
