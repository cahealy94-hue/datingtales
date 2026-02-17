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

  return Response.json({
    ok: true,
    user: loginData.user,
    session: {
      access_token: loginData.access_token,
      refresh_token: loginData.refresh_token,
    },
  });
}
