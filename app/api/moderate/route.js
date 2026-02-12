export async function POST(request) {
  const { storyText } = await request.json();

  if (!storyText || !storyText.trim()) {
    return Response.json({ status: "rejected", reason: "No story provided." }, { status: 400 });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // ── AI Moderation ──
  let result;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a content moderator for DatingTales, an anonymous dating story platform. Analyze and process the following dating story submission.

RULES:
1. REJECT if the story contains: explicit sexual content, hate speech, harassment, illegal activity, defamation, or violent content. If rejecting, respond with: {"status":"rejected","reason":"brief reason"}
2. If acceptable, REWRITE the story to:
   - Be 300 characters or less
   - Remove any identifying details (real names, specific cities, employers, schools)
   - Replace names with generic terms (e.g., "my date", "they", "he", "she")
   - Replace specific locations with generalized ones (e.g., "a coffee shop downtown")
   - Remove any provocative or explicit language
   - Maintain the humor, warmth, and tone
   - Keep it engaging and readable
3. Generate a fun, catchy title (max 40 chars)
4. Assign ONE theme from: First Dates, Meet Cutes, Dating App Disasters, Awkward Moments, Meeting the Family, Situationships
5. Generate a fun anonymous persona name like "Pasta Lover" or "Serial Texter" (no city, no real names)

Respond ONLY with JSON, no markdown fences:
{"status":"approved","title":"...","theme":"...","author":"...","rewritten":"..."}

STORY:
${storyText}`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.map(i => i.text || "").join("\n") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    result = JSON.parse(clean);
  } catch (err) {
    console.error("AI moderation error:", err);
    result = {
      status: "approved",
      title: "A Dating Tale",
      theme: "Awkward Moments",
      author: "Anonymous Storyteller",
      rewritten: storyText.slice(0, 300),
    };
  }

  // ── Save to Supabase ──
  if (result.status !== "rejected" && SUPABASE_SERVICE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          original_text: storyText,
          rewritten_text: result.rewritten,
          title: result.title,
          theme: result.theme,
          author_persona: result.author,
          status: "pending",
        }),
      });
    } catch (err) {
      console.error("Supabase save error:", err);
    }
  }

  return Response.json(result);
}
