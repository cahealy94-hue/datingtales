const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";

export async function POST(request) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  // Use service role key to auto-confirm email
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // Create user via admin API (auto-confirms email)
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || "",
      },
    }),
  });

  const createData = await createRes.json();

  if (!createRes.ok) {
    const msg = createData.msg || createData.error_description || createData.message || "Signup failed";
    // Check for duplicate email
    if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists") || msg.toLowerCase().includes("duplicate")) {
      return Response.json({ error: "already_exists" }, { status: 409 });
    }
    return Response.json({ error: msg }, { status: createRes.status });
  }

  // Now log them in to get a session
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    return Response.json({ error: "Account created but login failed. Please log in manually." }, { status: 200 });
  }

  // ── Add to subscribers table (upsert: if waitlist subscriber creates account, link their user_id) ──
  const userId = createData.id;
  fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Prefer: "return=minimal,resolution=merge-duplicates",
    },
    body: JSON.stringify({
      email,
      source: "account_signup",
      user_id: userId,
      first_name: name || null,
    }),
  }).catch(err => console.error("Subscribers table upsert error:", err));

  // ── Send welcome email via Resend (fire and forget) ──
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    const firstName = name || "there";
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Date&Tell <hello@dateandtell.com>",
        to: [email],
        subject: "Welcome to Date&Tell 💌",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px;">
            <a href="https://dateandtell.com" style="display: block; text-align: center; margin-bottom: 32px; text-decoration: none;">
              <h1 style="font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px;">Date&amp;Tell</h1>
              <p style="font-size: 13px; color: #2563EB; margin: 0; font-style: italic;">Love, Anonymous.</p>
            </a>
            <div style="background: linear-gradient(90deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9B59B6); height: 3px; border-radius: 2px; margin-bottom: 32px;"></div>
            <p style="font-size: 18px; color: #1a1a1a; margin: 0 0 16px;">Hey ${firstName},</p>
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin: 0 0 16px;">Welcome to <a href="https://dateandtell.com" style="color: #2563EB; text-decoration: none; font-weight: 600;">Date&amp;Tell</a>! You're all set up.</p>
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin: 0 0 16px;">Here's what you can do now:</p>
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin: 0 0 8px;">📝 <strong>Share a dating story:</strong> Anonymous, AI-polished, and totally judgment-free</p>
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin: 0 0 8px;">📊 <strong>Track your stories:</strong> See reactions, shares, and when you go live</p>
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin: 0 0 8px;">💌 <strong>Get the Friday drop:</strong> The best stories of the week, straight to your inbox</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://dateandtell.com/submit" style="display: inline-block; background: #2563EB; color: white; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-size: 16px; font-weight: 600;">Share a story</a>
            </div>
            <p style="font-size: 14px; color: #999; line-height: 1.6; margin: 32px 0 0; text-align: center;">You're getting this because you created a Date&amp;Tell account. We'll also send you the best dating stories every Friday.</p>
          </div>
        `,
      }),
    }).catch(err => console.error("Resend welcome email error:", err));
  }

  // ── Add to Beehiiv for Friday newsletter (fire and forget) ──
  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
  if (BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
    fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        send_welcome_email: false,
        utm_source: "account_signup",
      }),
    }).catch(err => console.error("Beehiiv add subscriber error:", err));
  }

  return Response.json({
    ok: true,
    user: loginData.user,
    session: {
      access_token: loginData.access_token,
      refresh_token: loginData.refresh_token,
    },
  });
}
