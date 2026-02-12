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
    // Show published stories with at least 1 report (but not yet deleted)
    url = `${SUPABASE_URL}/rest/v1/stories?report_count=gt.0&status=eq.published&order=report_count.desc`;
  } else {
    url = `${SUPABASE_URL}/rest/v1/stories?status=eq.${status}&order=submitted_at.desc`;
  }

  const res = await fetch(url, {
      headers: {
        apikey: getServiceKey(),
        Authorization: `Bearer ${getServiceKey()}`,
      },
    }
  );

  const data = await res.json();
  return Response.json(data);
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

  return Response.json({ ok: res.ok });
}
