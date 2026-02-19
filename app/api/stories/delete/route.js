export async function DELETE(request) {
  const { storyId } = await request.json();

  if (!storyId) {
    return Response.json({ error: "Missing storyId" }, { status: 400 });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vopnqpulwbofvbyztcta.supabase.co";
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    // Only delete stories that are still pending
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}&status=eq.pending`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: "return=representation",
        },
      }
    );

    if (!res.ok) {
      console.error("Supabase delete error:", res.status, await res.text());
      return Response.json({ error: "Failed to delete" }, { status: 500 });
    }

    const deleted = await res.json();
    return Response.json({ deleted: deleted.length > 0 });
  } catch (err) {
    console.error("Delete error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
