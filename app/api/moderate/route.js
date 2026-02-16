export async function POST(request) {
  const { storyText } = await request.json();

  if (!storyText || !storyText.trim()) {
    return Response.json({ status: "rejected", reason: "No story provided." }, { status: 400 });
  }

  // Vercel provides geolocation headers automatically
  const city = request.headers.get("x-vercel-ip-city") || "";
  const country = request.headers.get("x-vercel-ip-country") || "";

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
          content: `You are a story editor for Date & Tell, an anonymous dating story platform. Your job is to lightly edit submissions while keeping the original voice intact.

REJECTION RULES:
Reject if the story contains: explicit sexual content, hate speech, harassment, illegal activity, defamation, or violent content. If rejecting, respond with: {"status":"rejected","reason":"brief reason"}

EDITING RULES:
If acceptable, edit the story following these rules:
- Keep it under 500 characters
- Remove any identifying details (real names, specific cities, employers, schools)
- Replace names with generic terms (e.g., "my date", "they", "he", "she"). But keep celebrity or pop culture references — they add personality and context.
- Replace specific locations with generalized ones (e.g., "a coffee shop downtown")
- Remove graphic or explicit sexual language, but keep mildly edgy or suggestive phrasing if it's part of the humor. "Sexual" and "awkward" are fine. Graphic descriptions are not.
- Keep the original person's voice, but DO shape the story to be more engaging. You're an editor, not a spell-checker. Cut the boring parts, keep the funny parts, and make it land.
- Keep their best details and comparisons. If they made a funny reference or comparison, that's the gold. Don't strip it out or replace it with something generic.
- Think of it like retelling your friend's story at a party. You'd keep the best parts, skip the setup no one needs, and make sure the punchline hits.

TONE RULES (CRITICAL):
- The story should sound like a real person wrote it, not an AI. Read it back and ask: would a 25-year-old actually say this out loud to a friend? If not, rewrite it.
- Never use em dashes. Use commas, periods, or "and" instead.
- Never use flowery or poetic language. No "cuddled," "nestled," "blossomed," "ignited a spark," etc.
- Never exaggerate or embellish what happened. Stick to what the person actually described. If they said the dogs played together, say the dogs played together. Do not say the dogs cuddled.
- Keep the humor natural. Don't force punchlines or add jokes that weren't in the original.
- Use casual, conversational language. Short sentences are fine. Fragments are fine.
- Contractions always (don't, can't, wasn't, etc.)
- DO NOT clean up the story too much. Keep the messy, raw, imperfect feel. Real stories ramble a little, change direction, and don't wrap up perfectly. That's what makes them good.
- Never add a moral, lesson, or neat ending. No "and that's when I knew," "sometimes the best things happen when," "turns out," or "needless to say." If the original didn't have a tidy conclusion, don't add one.
- Don't over-restructure their sentences, but do tighten them. Cut filler that doesn't add personality, keep filler that does. "Like" and "honestly" can stay if they sound natural. "Proceeded to" and "supposedly" should go.

EXAMPLE OF A BAD REWRITE (too literal, just grammar cleanup):
Original: "he proceeded to pull out a guitar and serenade me with a song that was inspired by me. It was so sexual, like John Mayer's Your body is a wonderland but much worse since he was a stranger!"
Bad: "he pulled out a guitar to serenade me with a song he said he wrote about me. It was super inappropriate and sexual, like he barely knew me but was singing about my body. So uncomfortable!"
Good: "he pulled out a guitar and serenaded me with a song he 'wrote for me.' It was giving Your Body Is a Wonderland but like, sir, we met 45 minutes ago."

The good version keeps their funny comparison, tightens the phrasing, and lets the humor land naturally.

ALSO GENERATE:
- A fun, catchy title (max 40 chars). Make it sound like a group chat message, not a newspaper headline.
- Assign ONE theme from: First Dates, Meet Cutes, Dating App Disasters, Awkward Moments, Meeting the Family, Situationships
- A fun anonymous persona name like "Pasta Lover" or "Serial Texter" (no city names, no real names, keep it playful)
- A comma-separated list of 10-20 search tags. These are lowercase keywords someone might search to find this story. Include: key nouns (dog, coffee, restaurant), synonyms (puppy, pup, cafe), emotions (embarrassing, funny, sweet), activities (texting, hiking, cooking), relationship terms (ex, crush, situationship), and general vibes (awkward, romantic, chaotic). Be generous with synonyms.

Respond ONLY with JSON, no markdown fences:
{"status":"approved","title":"...","theme":"...","author":"...","rewritten":"...","tags":"dog,puppy,pup,park,embarrassing,funny,..."}

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
          search_tags: result.tags ? result.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
          city: decodeURIComponent(city),
          country,
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
