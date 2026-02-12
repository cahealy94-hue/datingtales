const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";

export async function POST(request) {
  const { storyId, reason } = await request.json();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!storyId || !reason) {
    return Response.json({ error: "Missing storyId or reason" }, { status: 400 });
  }

  // Save the report
  await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ story_id: storyId, reason }),
  });

  // Increment report_count on the story
  // First get current count
  const storyRes = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}&select=report_count,status`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );
  const storyData = await storyRes.json();
  const currentCount = storyData[0]?.report_count || 0;
  const newCount = currentCount + 1;

  const updateData = { report_count: newCount };
  let deleted = false;

  // Auto-delete at 3 reports
  if (newCount >= 3) {
    updateData.status = "deleted";
    deleted = true;
  }

  await fetch(`${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(updateData),
  });

  return Response.json({ ok: true, report_count: newCount, deleted });
}
