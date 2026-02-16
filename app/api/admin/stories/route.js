const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_KEY;
}

function checkAuth(request) {
  const password = request.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  let url;
  if (status === "reported") {
    url = `${SUPABASE_URL}/rest/v1/stories?report_count=gt.0&status=eq.published&order=report_count.desc`;
  } else if (status === "deleted") {
    url = `${SUPABASE_URL}/rest/v1/stories?status=eq.deleted&order=submitted_at.desc`;
  } else {
    // Works for: pending, approved, queued, published, rejected
    url = `${SUPABASE_URL}/rest/v1/stories?status=eq.${status}&order=submitted_at.desc`;
  }

  const res = await fetch(url, {
    headers: {
      apikey: getServiceKey(),
      Authorization: `Bearer ${getServiceKey()}`,
    },
  });

  const stories = await res.json();

  // Fetch report reasons for reported/deleted stories
  if ((status === "reported" || status === "deleted") && Array.isArray(stories) && stories.length > 0) {
    const storyIds = stories.map(s => s.id);
    const reportsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/reports?story_id=in.(${storyIds.join(",")})&order=reported_at.desc`,
      {
        headers: {
          apikey: getServiceKey(),
          Authorization: `Bearer ${getServiceKey()}`,
        },
      }
    );
    const reports = await reportsRes.json();
    const storiesWithReports = stories.map(s => ({
      ...s,
      reports: Array.isArray(reports) ? reports.filter(r => r.story_id === s.id) : [],
    }));
    return Response.json(storiesWithReports);
  }

  return Response.json(stories);
}

export async function PATCH(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, title, rewritten_text, author_persona, theme } = body;

  const updateData = {};
  if (status) {
    updateData.status = status;
    if (status === "published") {
      updateData.published_at = new Date().toISOString();
    }
  }
  if (title !== undefined) updateData.title = title;
  if (rewritten_text !== undefined) updateData.rewritten_text = rewritten_text;
  if (author_persona !== undefined) updateData.author_persona = author_persona;
  if (theme !== undefined) updateData.theme = theme;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: getServiceKey(),
        Authorization: `Bearer ${getServiceKey()}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(updateData),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Supabase PATCH error:", res.status, errText);
    return Response.json({ ok: false, error: errText }, { status: res.status });
  }

  return Response.json({ ok: true });
}
