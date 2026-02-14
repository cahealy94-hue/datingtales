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
          content: `You are a story editor for The Dating Tales, an anonymous dating story platform. Your job is to lightly edit submissions while keeping the original voice intact.

REJECTION RULES:
Reject if the story contains: explicit sexual content, hate speech, harassment, illegal activity, defamation, or violent content. If rejecting, respond with: {"status":"rejected","reason":"brief reason"}

EDITING RULES:
If acceptable, edit the story following these rules:
- Keep it under 500 characters
- Remove any identifying details (real names, specific cities, employers, schools)
- Replace names with generic terms (e.g., "my date", "they", "he", "she")
- Replace specific locations with generalized ones (e.g., "a coffee shop downtown")
- Remove any provocative or explicit language
- Keep the original person's voice and phrasing as much as possible. Do NOT over-edit. Light touch only.

TONE RULES (CRITICAL):
- The story should sound like a real person wrote it, not an AI. Read it back and ask: would a 25-year-old actually say this out loud to a friend? If not, rewrite it.
- Never use em dashes. Use commas, periods, or "and" instead.
- Never use flowery or poetic language. No "cuddled," "nestled," "blossomed," "ignited a spark," etc.
- Never exaggerate or embellish what happened. Stick to what the person actually described. If they said the dogs played together, say the dogs played together. Do not say the dogs cuddled.
- Keep the humor natural. Don't force punchlines or add jokes that weren't in the original.
- Use casual, conversational language. Short sentences are fine. Fragments are fine.
- Contractions always (don't, can't, wasn't, etc.)

ALSO GENERATE:
- A fun, catchy title (max 40 chars). Make it sound like a group chat message, not a newspaper headline.
- Assign ONE theme from: First Dates, Meet Cutes, Dating App Disasters, Awkward Moments, Meeting the Family, Situationships
- A fun anonymous persona name like "Pasta Lover" or "Serial Texter" (no city names, no real names, keep it playful)

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
      rewritten: storyText.slice(0, 500),
    };
  }

  // ── Save to Supabase ──
  if (result.status !== "rejected" && SUPABASE_SERVICE_KEY) {
    try {
      const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: "return=representation",
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
      const saved = await saveRes.json();
      if (Array.isArray(saved) && saved.length > 0) {
        result.storyId = saved[0].id;
      }
    } catch (err) {
      console.error("Supabase save error:", err);
    }
  }

  return Response.json(result);
}
