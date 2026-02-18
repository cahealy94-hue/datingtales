const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";

export async function POST(request) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const beehiivApiKey = process.env.BEEHIIV_API_KEY;
  const beehiivPubId = process.env.BEEHIIV_PUBLICATION_ID;

  // Save to Supabase subscribers table
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email,
        source: "waitlist",
      }),
    });
    // 409 = duplicate email, that's fine
    if (!res.ok && res.status !== 409) {
      console.error("Supabase subscriber error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Supabase subscriber error:", err);
  }

  // Add to Beehiiv
  if (beehiivApiKey && beehiivPubId) {
    try {
      await fetch(`https://api.beehiiv.com/v2/publications/${beehiivPubId}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${beehiivApiKey}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
        }),
      });
    } catch (err) {
      console.error("Beehiiv subscriber error:", err);
    }
  }

  return Response.json({ ok: true });
}
