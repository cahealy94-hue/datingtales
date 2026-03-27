import { randomBytes } from "crypto";

// In-memory session store (resets on cold start, fine for solo admin use)
export const sessions = new Map();
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12 hours

export async function POST(request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate a session token instead of returning ok
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { createdAt: Date.now() });

  return Response.json({ token });
}
