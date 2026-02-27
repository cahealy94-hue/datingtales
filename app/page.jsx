"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ── Supabase Config ──
const SUPABASE_URL = "https://vopnqpulwbofvbyztcta.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcG5xcHVsd2JvZnZieXp0Y3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjM1MDEsImV4cCI6MjA4NjQzOTUwMX0.eHiT32WgGqJcO--htiAFR5gpWIgET28j2j3_ZCKmzkY";

// ── Icons ──
const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const FlagIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const ShareIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12l-7-7v4C7 9 4 14 3 19c2.5-3.5 6-5.1 11-5.1V18l7-6z"/></svg>;
const StarIcon = ({ filled }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke={filled ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

// ── Fallback Stories ──
const SAMPLE_STORIES = [
  { id: 1, title: "The Great Spaghetti Incident", theme: "First Dates", author: "Pasta Enthusiast", text: "Ordered spaghetti on a first date to seem 'cultured.' Twirled too aggressively. Sauce on my forehead, noodle on my chin. He said 'you've got a little something' and gestured at my entire face. We've been together two years now.", publishedAt: "2026-02-07", reactions: { "😂": 89, "❤️": 45, "😬": 23 }, tags: "spaghetti,pasta,food,dinner,restaurant,italian,messy,embarrassing,funny,sauce,date,first date,cute,together" },
  { id: 2, title: "Autocorrect Strikes Again", theme: "Dating App Disasters", author: "Typo Queen", text: "Tried to text my date 'I'm on my way, can't wait!' Autocorrect changed it to 'I'm on my way, can't walk!' He showed up with a wheelchair he borrowed from his grandma.", publishedAt: "2026-02-07", reactions: { "😂": 112, "❤️": 18, "😬": 67 } , tags: "texting,text,autocorrect,phone,message,typo,funny,hilarious,wheelchair,grandma,embarrassing,sweet" },
  { id: 3, title: "The Dog Park Meet-Cute", theme: "Meet Cutes", author: "Golden Retriever Parent", text: "My dog ran full speed into a stranger at the park, knocked his coffee everywhere. I ran over apologizing. He looked at my dog, looked at me, and said 'worth it.' We now share custody of three dogs.", publishedAt: "2026-02-07", reactions: { "❤️": 95, "😂": 34, "✨": 41 } , tags: "dog,dogs,puppy,puppies,pup,pet,park,coffee,cute,sweet,romantic,meet cute,golden retriever,animal" },
  { id: 4, title: "Mom's Interrogation Protocol", theme: "Meeting the Family", author: "Nervous Wreck", text: "Brought my date to meet my mom. Within five minutes she'd pulled out my baby photos, asked about his credit score, and offered him my grandmother's ring.", publishedAt: "2026-02-07", reactions: { "😂": 72, "😬": 44, "❤️": 12 } , tags: "mom,mother,parent,family,meeting,baby photos,embarrassing,funny,ring,awkward,nervous,interrogation" },
  { id: 5, title: "The Label Conversation", theme: "Situationships", author: "Hopeless Romantic", text: "After four months of 'hanging out' I finally asked where we stood. He said 'I really like what we have.' I said 'what do we have?' He said 'this conversation is a great example.'", publishedAt: "2026-01-31", reactions: { "😂": 134, "😬": 89, "💀": 67 } , tags: "situationship,relationship,label,define,commitment,hanging out,funny,frustrating,conversation,what are we" },
  { id: 6, title: "Wrong Table, Right Person", theme: "Awkward Moments", author: "Latte Lover", text: "Showed up to a blind date at a coffee shop. Sat down across from someone, chatted for ten minutes. Turns out it wasn't my date — just a very friendly stranger. My actual date watched the whole thing from two tables over.", publishedAt: "2026-01-31", reactions: { "❤️": 88, "😂": 56, "✨": 73 } , tags: "coffee,cafe,coffee shop,blind date,stranger,awkward,embarrassing,funny,wrong person,mistaken identity" },
  { id: 7, title: "The Zoom Background Betrayal", theme: "Dating App Disasters", author: "Remote Worker", text: "Had a video date. Used a fancy apartment as my virtual background. Cat jumped on my desk and knocked my laptop, revealing my actual studio apartment with laundry everywhere.", publishedAt: "2026-01-31", reactions: { "😂": 78, "❤️": 22, "😬": 31 } , tags: "zoom,video call,virtual,cat,kitten,pet,apartment,laundry,embarrassing,funny,work from home,background,laptop" },
  { id: 8, title: "Uber Driver Played Cupid", theme: "Meet Cutes", author: "Backseat Romantic", text: "Shared a pool ride with a stranger. Driver kept 'accidentally' taking wrong turns to extend the trip. We talked for forty minutes. As we got out, the driver handed us both a receipt that said 'you're welcome.'", publishedAt: "2026-01-31", reactions: { "❤️": 121, "✨": 56, "😂": 43 } , tags: "uber,lyft,rideshare,car,driving,stranger,romantic,sweet,cute,meet cute,cupid,funny,ride" },
];

const THEMES = ["First Dates", "Meet Cutes", "Dating App Disasters", "Awkward Moments", "Meeting the Family", "Situationships"];
const EMOJI_OPTIONS = ["😂", "❤️", "😬", "✨", "💀", "💯"];
const REPORT_REASONS = ["Inappropriate or explicit content", "Hate speech or discrimination", "Contains personal information", "Harassment or bullying", "Spam or fake story"];

// ── Synonym Map for Smart Search ──
const SYNONYM_MAP = {
  dog: ["puppy", "puppies", "pup", "pups", "doggo", "canine", "pet"],
  puppy: ["dog", "puppies", "pup", "pups", "doggo", "canine", "pet"],
  cat: ["kitten", "kitty", "feline", "pet"],
  kitten: ["cat", "kitty", "feline", "pet"],
  bar: ["pub", "club", "nightclub", "drinks", "cocktail", "lounge"],
  club: ["bar", "nightclub", "pub", "lounge", "dancing"],
  coffee: ["cafe", "latte", "espresso", "starbucks", "tea"],
  cafe: ["coffee", "latte", "espresso", "coffeeshop"],
  restaurant: ["dinner", "dining", "food", "meal", "brunch", "lunch"],
  dinner: ["restaurant", "dining", "food", "meal", "supper"],
  brunch: ["breakfast", "lunch", "restaurant", "food", "meal"],
  text: ["texting", "message", "dm", "sms", "chat"],
  texting: ["text", "message", "dm", "sms", "chat"],
  phone: ["call", "facetime", "text", "mobile", "cell"],
  kiss: ["kissing", "makeout", "smooch", "peck"],
  kissing: ["kiss", "makeout", "smooch"],
  ex: ["breakup", "ex-boyfriend", "ex-girlfriend", "former", "past"],
  breakup: ["ex", "split", "dumped", "ended"],
  crush: ["like", "into", "feelings", "attraction"],
  tinder: ["bumble", "hinge", "dating app", "swipe", "match"],
  bumble: ["tinder", "hinge", "dating app", "swipe", "match"],
  hinge: ["tinder", "bumble", "dating app", "swipe", "match"],
  awkward: ["cringe", "cringey", "embarrassing", "uncomfortable", "weird"],
  cringe: ["awkward", "cringey", "embarrassing", "uncomfortable"],
  embarrassing: ["awkward", "cringe", "mortifying", "humiliating"],
  funny: ["hilarious", "lol", "comedy", "laugh", "humor"],
  hilarious: ["funny", "lol", "comedy", "laugh"],
  sweet: ["cute", "romantic", "adorable", "wholesome", "lovely"],
  cute: ["sweet", "romantic", "adorable", "wholesome"],
  romantic: ["sweet", "cute", "love", "romance", "dreamy"],
  scary: ["terrifying", "creepy", "horror", "frightening", "spooky"],
  creepy: ["scary", "weird", "uncomfortable", "unsettling"],
  drunk: ["drinking", "wasted", "tipsy", "hammered", "alcohol", "wine", "beer"],
  drinking: ["drunk", "alcohol", "wine", "beer", "cocktail", "bar"],
  car: ["driving", "uber", "lyft", "ride"],
  movie: ["movies", "film", "theater", "cinema", "netflix"],
  wedding: ["married", "marriage", "engaged", "engagement", "proposal"],
  parent: ["parents", "mom", "dad", "mother", "father", "family"],
  mom: ["mother", "parent", "mama", "family"],
  dad: ["father", "parent", "papa", "family"],
  friend: ["friends", "buddy", "bestie", "bff", "pal"],
  work: ["job", "office", "coworker", "colleague", "boss"],
  gym: ["workout", "exercise", "fitness", "lifting", "running"],
  beach: ["ocean", "sea", "swimming", "sand", "surf"],
  travel: ["trip", "vacation", "flight", "airport", "abroad"],
  cook: ["cooking", "kitchen", "recipe", "chef", "baking"],
  hiking: ["hike", "trail", "nature", "outdoors", "walk"],
  concert: ["music", "show", "gig", "festival", "band"],
};

function stem(word) {
  const w = word.toLowerCase();
  const roots = new Set([w]);
  if (w.endsWith("ing")) roots.add(w.slice(0, -3)).add(w.slice(0, -3) + "e");
  if (w.endsWith("ed")) roots.add(w.slice(0, -2)).add(w.slice(0, -2) + "e");
  if (w.endsWith("s") && !w.endsWith("ss")) roots.add(w.slice(0, -1));
  if (w.endsWith("es")) roots.add(w.slice(0, -2));
  if (w.endsWith("ies")) roots.add(w.slice(0, -3) + "y");
  if (w.endsWith("ly")) roots.add(w.slice(0, -2));
  if (w.endsWith("er")) roots.add(w.slice(0, -2)).add(w.slice(0, -2) + "e");
  roots.add(w + "s"); roots.add(w + "ing"); roots.add(w + "ed"); roots.add(w + "er");
  if (w.endsWith("e")) { roots.add(w.slice(0, -1) + "ing"); roots.add(w.slice(0, -1) + "er"); }
  if (w.endsWith("y")) roots.add(w.slice(0, -1) + "ies");
  return [...roots].filter(r => r.length > 1);
}

function expandSearch(query) {
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);
  const expanded = new Set();
  terms.forEach(term => {
    const stemmed = stem(term);
    stemmed.forEach(s => expanded.add(s));
    stemmed.forEach(s => {
      if (SYNONYM_MAP[s]) {
        SYNONYM_MAP[s].forEach(syn => expanded.add(syn));
      }
    });
  });
  return [...expanded];
}

// ── Auth Helpers ──
function getStoredAuth() {
  try {
    const stored = localStorage.getItem("dt_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.user && parsed.access_token) return parsed;
    }
  } catch {}
  return null;
}

function storeAuth(authData) {
  try { localStorage.setItem("dt_auth", JSON.stringify(authData)); } catch {}
}

function clearAuth() {
  try { localStorage.removeItem("dt_auth"); } catch {}
}

function getUnlinkedStoryIds() {
  try {
    const ids = JSON.parse(localStorage.getItem("dt_unlinked_stories") || "[]");
    return Array.isArray(ids) ? ids : [];
  } catch { return []; }
}

function addUnlinkedStoryId(id) {
  try {
    const ids = getUnlinkedStoryIds();
    if (!ids.includes(id)) ids.push(id);
    localStorage.setItem("dt_unlinked_stories", JSON.stringify(ids));
  } catch {}
}

function clearUnlinkedStoryIds() {
  try { localStorage.removeItem("dt_unlinked_stories"); } catch {}
}

// ── Story Card Component ──
function StoryCard({ story, onReaction, onReport, onSave, reacted, isSaved, isTrending, storyText, onStoryTextChange, onNavigateSubmit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportStep, setReportStep] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [pendingReport, setPendingReport] = useState(false);
  const [shared, setShared] = useState(false);
  const beenThereShownRef = useRef(false);
const [beenThereModal, setBeenThereModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSubmitReport = () => { if (!selectedReason) return; setPendingReport(true); setReportStep("done"); };
  const handleCloseReport = () => { setReportStep(null); if (pendingReport) { onReport(story.id, selectedReason); } setSelectedReason(null); setPendingReport(false); };

  const handleShare = async () => {
    const shareUrl = "https://dateandtell.com";
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    try {
      if (isMobile && navigator.share) {
        await navigator.share({ title: story.title, text: "Check out this story on Date&Tell!", url: shareUrl });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`"${story.title}" — ${story.text}\n\n— ${story.author} on Date & Tell\n${shareUrl}`);
      }
    } catch {}
    setShared(true); setTimeout(() => setShared(false), 2500);
  };

  const themeClass = `theme-${story.theme.toLowerCase().replace(/ /g, "-")}`;

  return (
    <>
      <div className={`story-card ${isTrending ? "story-card-trending" : ""}`}>
        <div className="story-card-header">
          <div className="story-card-title">{story.title}</div>
          <div className="story-header-right">
            {isTrending && <span className="trending-badge">🔥 Trending</span>}
            <div className="story-menu-wrap" ref={menuRef}>
            <button className="story-card-dots" onClick={() => setMenuOpen(!menuOpen)}>···</button>
            {menuOpen && (
              <div className="story-menu-dropdown">
                <button className="story-menu-item share-item" onClick={() => { setMenuOpen(false); handleShare(); }}>
                  <ShareIcon /> Share Story
                </button>
                <button className="story-menu-item save-item" onClick={() => { setMenuOpen(false); onSave?.(story.id); }}>
                  <StarIcon filled={isSaved} /> {isSaved ? "Saved" : "Save Story"}
                </button>
                <button className="story-menu-item report-item" onClick={() => { setMenuOpen(false); setReportStep("select"); }}>
                  <FlagIcon /> Report Story
                </button>
              </div>
            )}
          </div>
          </div>
        </div>
        <span className={`story-card-theme ${themeClass}`}>{story.theme}</span>
        <div className="story-card-text">{story.text}</div>
        <div className="story-card-persona">— {story.author}</div>
        <div className="story-card-divider" />
        <div className="story-card-reactions">
          {EMOJI_OPTIONS.map(emoji => {
            const count = story.reactions?.[emoji] || 0;
            const isActive = reacted[`${story.id}-${emoji}`];
            return (
              <button key={emoji} className={`story-reaction ${isActive ? "active" : ""}`} onClick={() => { onReaction(story.id, emoji); if (emoji === "💯" && !isActive && !beenThereShownRef.current) { beenThereShownRef.current = true; setBeenThereModal(true); } }}>
                {emoji}{count > 0 && <span className="reaction-count">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {reportStep && (
        <div className="report-overlay" onClick={(e) => { if (e.target === e.currentTarget) { if (reportStep === "done") handleCloseReport(); else { setReportStep(null); setSelectedReason(null); } } }}>
          <div className="report-modal">
            {reportStep === "select" ? (
              <>
                <h3>Report this story</h3>
                <p className="report-sub">Help us keep Date & Tell safe. Why are you reporting this?</p>
                <div className="report-options">
                  {REPORT_REASONS.map(reason => (
                    <button key={reason} className={`report-option ${selectedReason === reason ? "selected" : ""}`} onClick={() => setSelectedReason(reason)}>
                      <span className="ro-radio" />{reason}
                    </button>
                  ))}
                </div>
                <div className="report-actions">
                  <button className="report-cancel" onClick={() => { setReportStep(null); setSelectedReason(null); }}>Cancel</button>
                  <button className="report-submit" onClick={handleSubmitReport} disabled={!selectedReason}>Submit report</button>
                </div>
              </>
            ) : (
              <div className="report-success">
                <div className="report-success-icon"><CheckIcon /></div>
                <h3>Thanks for letting us know</h3>
                <p>We've received your report and will review this story. It's been removed from your feed.</p>
                <button className="report-cancel" style={{ marginTop: 20, width: "100%" }} onClick={handleCloseReport}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
{beenThereModal && (
  <div className="report-overlay" onClick={() => setBeenThereModal(false)}>
    <div onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: "100%", margin: "0 20px" }}>
      <div className="submit-page-rainbow" />
      <div style={{ background: "white", borderRadius: "0 0 20px 20px", padding: "32px 24px", border: "1px solid var(--border)", borderTop: "none", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h1 style={{ fontFamily: "var(--font)", fontSize: 24, fontWeight: 700, color: "var(--black)", margin: 0 }}>💯 Been there?</h1>
          <button onClick={() => setBeenThereModal(false)} style={{ background: "none", border: "none", fontSize: 22, color: "var(--gray-light)", cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ fontFamily: "var(--font)", fontSize: 14, color: "var(--gray)", marginBottom: 16 }}>Your worst date is someone's best Friday read.</p>
        <textarea className="submit-page-textarea" placeholder="Tell us your dating moment…" value={storyText} onChange={e => onStoryTextChange(e.target.value)} style={{ minHeight: 120 }} />
        <button className="submit-page-btn" style={{ marginTop: 12 }} onClick={() => { setBeenThereModal(false); onNavigateSubmit(); }}>Submit story</button>
        <p style={{ fontFamily: "var(--font)", fontSize: 12, color: "var(--gray-light)", textAlign: "center", marginTop: 10 }}>🔒 100% anonymous. Always.</p>
      </div>
    </div>
  </div>
)}
      {shared && (
        <div className="share-toast">
          <CheckIcon /> Link copied
        </div>
      )}
    </>
  );
}

// ── Main App ──
export default function DateAndTell() {
  const getPageFromPath = () => {
    const path = window.location.pathname.replace(/^\//, "");
    if (["library", "submit", "subscribe", "login", "signup", "dashboard", "forgot-password", "reset-password", "terms", "privacy"].includes(path)) return path;
    return "home";
  };

  const [email, setEmail] = useState("");
  const [heroSub, setHeroSub] = useState(false);
  const [ctaSub, setCtaSub] = useState(false);
  const [pageSub, setPageSub] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [page, setPageState] = useState("home");
  const [filter, setFilter] = useState("All");
  const [stories, setStories] = useState(SAMPLE_STORIES);
  const [savedStories, setSavedStories] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dt_saved_stories") || "[]"); } catch { return []; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [originalStoryText, setOriginalStoryText] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [regeneratingTitle, setRegeneratingTitle] = useState(false);
  const [regeneratingStory, setRegeneratingStory] = useState(false);
  const [storyReactions, setStoryReactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dt_reactions") || "{}"); } catch { return {}; }
  });
  const [hiddenStories, setHiddenStories] = useState(new Set());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryShuffleKey, setLibraryShuffleKey] = useState(() => Date.now());

  // ── Auth State ──
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupReason, setSignupReason] = useState(null);
  const pendingSaveRef = useRef(null);
  const [dashboardStories, setDashboardStories] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashFilter, setDashFilter] = useState("all");
  const [showDashWelcome, setShowDashWelcome] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Load auth on mount
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) setAuthUser(stored);
  }, []);

  const setPage = (p) => {
    setPageState(p);
    setMobileMenu(false);
    setSearchQuery("");
    setAuthError("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
    if (p !== "signup") setSignupReason(null);
    const url = p === "home" ? "/" : `/${p}`;
    window.history.pushState({}, "", url);
    window.scrollTo(0, 0);
    if (p === "library") setLibraryShuffleKey(k => k + 1);
  };

  useEffect(() => {
    setLoaded(true);
    setPageState(getPageFromPath());
    const onPop = () => setPageState(getPageFromPath());
    window.addEventListener("popstate", onPop);

    // Parse recovery token from Supabase redirect hash
    if (window.location.pathname === "/reset-password" && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const token = params.get("access_token");
      const type = params.get("type");
      if (token && type === "recovery") {
        setResetToken(token);
        setPageState("reset-password");
        // Clean up the URL
        window.history.replaceState({}, "", "/reset-password");
      }
    }

    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Fetch published stories from Supabase
  useEffect(() => {
    async function fetchPublished() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/stories?status=eq.published&order=published_at.desc`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const dbStories = data.map(s => ({
              id: s.id, title: s.title, theme: s.theme, author: s.author_persona,
              text: s.rewritten_text,
              tags: Array.isArray(s.search_tags) ? s.search_tags : [],
              publishedAt: s.published_at || new Date().toISOString(),
              reactions: s.reactions || {},
            }));
            // Add sort score and trending flag to each story
            dbStories.forEach(s => {
              s._sortScore = Object.values(s.reactions || {}).reduce((sum, n) => sum + n, 0);
            });
            const sorted = [...dbStories].sort((a, b) => b._sortScore - a._sortScore);
            const minTrending = 5;
            const trendingSet = new Set(sorted.filter(s => s._sortScore >= minTrending).slice(0, 2).map(s => s.id));
            dbStories.forEach(s => { s._isTrending = trendingSet.has(s.id); });
            setStories(dbStories);
          }
        }
      } catch (err) { console.error("Failed to fetch stories:", err); }
    }
    fetchPublished();
  }, []);

  // Fetch dashboard stories when on dashboard
  useEffect(() => {
    if (page !== "dashboard" || !authUser) return;
    // Show welcome popup on first visit
    try {
      const welcomeKey = `dt_dash_welcomed_${authUser.user.id}`;
      if (!localStorage.getItem(welcomeKey)) {
        setShowDashWelcome(true);
        localStorage.setItem(welcomeKey, "1");
      }
    } catch {}
    async function fetchMyStories() {
      setDashboardLoading(true);
      try {
        const res = await fetch("/api/auth/my-stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: authUser.user.id }),
        });
        const data = await res.json();
        if (data.ok) setDashboardStories(data.stories || []);
      } catch (err) { console.error("Dashboard fetch error:", err); }
      setDashboardLoading(false);
    }
    fetchMyStories();
  }, [page, authUser]);

  // ── Auth Handlers ──
  const linkStoriesAndGo = async (userId) => {
    const unlinked = getUnlinkedStoryIds();
    if (unlinked.length > 0) {
      try {
        await fetch("/api/auth/link-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyIds: unlinked, userId }),
        });
        clearUnlinkedStoryIds();
      } catch (err) { console.error("Link story error:", err); }
    }
    // Apply pending save if user tried to save before signing up
    if (pendingSaveRef.current) {
      const pid = String(pendingSaveRef.current);
      setSavedStories(prev => {
        const updated = prev.includes(pid) ? prev : [...prev, pid];
        try { localStorage.setItem("dt_saved_stories", JSON.stringify(updated)); } catch {}
        return updated;
      });
      pendingSaveRef.current = null;
    }
    setPage("dashboard");
  };

  const handleSignup = useCallback(async () => {
    if (!authEmail || !authPassword) return;
    if (authPassword.length < 6) { setAuthError("Password must be at least 6 characters"); return; }
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword, name: authName }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        if (data.error === "already_exists") {
          setAuthError("already_exists");
        } else {
          setAuthError(data.error || "Signup failed");
        }
      } else if (data.user && data.session) {
        const authData = { user: data.user, access_token: data.session.access_token, refresh_token: data.session.refresh_token };
        storeAuth(authData);
        setAuthUser(authData);
        await linkStoriesAndGo(data.user.id);
      } else {
        setAuthError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  }, [authEmail, authPassword, authName]);

  const handleLogin = useCallback(async () => {
    if (!authEmail || !authPassword) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Login failed");
      } else {
        const authData = { user: data.user, access_token: data.access_token, refresh_token: data.refresh_token };
        storeAuth(authData);
        setAuthUser(authData);
        await linkStoriesAndGo(data.user.id);
      }
    } catch (err) {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  }, [authEmail, authPassword]);

  const handleLogout = () => {
    clearAuth();
    setAuthUser(null);
    setDashboardStories([]);
    setPage("home");
  };

  const handleResetRequest = useCallback(async () => {
    if (!authEmail) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });
      setResetSent(true);
    } catch {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  }, [authEmail]);

  const handleResetPassword = useCallback(async () => {
    if (!authPassword || !resetToken) return;
    if (authPassword.length < 6) { setAuthError("Password must be at least 6 characters"); return; }
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: resetToken, newPassword: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Failed to reset password. The link may have expired.");
      } else {
        setResetSuccess(true);
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  }, [authPassword, resetToken]);

  // ── Handlers ──
  const handleSubscribe = useCallback(async (source) => {
    if (!email.includes("@")) return;
    if (source === "hero") setHeroSub(true);
    else if (source === "cta") setCtaSub(true);
    else if (source === "page") setPageSub(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) { console.error("Subscribe error:", err); }
  }, [email]);

  const handleSubmitStory = useCallback(async () => {
    if (!storyText.trim() || submitting) return;
    setSubmitting(true);
    setSubmitResult(null);
    setEditingSubmission(false);
    setEditedText("");
    setEditedTitle("");
    setShowSignupPrompt(false);
    setShowOriginal(false);
    try {
      const body = { storyText };
      // If logged in, attach userId
      if (authUser) body.userId = authUser.user.id;

      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.status === "rejected") {
        setSubmitResult({ type: "rejected", message: result.reason || "We couldn't publish this one, but we'd love a lighter version!" });
      } else {
        setSubmitResult({ type: "approved", storyId: result.storyId, story: { title: result.title, theme: result.theme, author: result.author, text: result.rewritten } });
        setOriginalStoryText(storyText);
        setStoryText("");

        // If not logged in, save story ID for later linking
        if (!authUser && result.storyId) {
          addUnlinkedStoryId(result.storyId);
          setShowSignupPrompt(true);
          // After 2 seconds, gently scroll to peek the signup card into view
          setTimeout(() => {
            const el = document.getElementById("post-submit-signup");
            if (el) {
              const rect = el.getBoundingClientRect();
              const peekAmount = 140; // Show rainbow bar + title + subtitle
              // Scroll if the signup card top is below the visible area
              if (rect.top > window.innerHeight - 40) {
                const scrollTarget = window.pageYOffset + rect.top - window.innerHeight + peekAmount;
                window.scrollTo({ top: scrollTarget, behavior: "smooth" });
              }
            }
          }, 2500);
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitResult({ type: "rejected", message: "Something went wrong. Please try again!" });
    }
    setSubmitting(false);
  }, [storyText, submitting, authUser]);

  const handleReaction = useCallback((storyId, emoji) => {
    const key = `${storyId}-${emoji}`;
    const alreadyReacted = storyReactions[key];
    const action = alreadyReacted ? "remove" : "add";

    setStoryReactions(prev => {
      const next = { ...prev };
      if (alreadyReacted) { delete next[key]; } else { next[key] = true; }
      try { localStorage.setItem("dt_reactions", JSON.stringify(next)); } catch {}
      return next;
    });
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const reactions = { ...s.reactions };
      reactions[emoji] = (reactions[emoji] || 0) + (alreadyReacted ? -1 : 1);
      if (reactions[emoji] <= 0) delete reactions[emoji];
      return { ...s, reactions };
    }));

    fetch("/api/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId, emoji, action }),
    }).then(res => res.json()).then(data => {
      if (!data.ok) console.error("Reaction API error:", data);
    }).catch(err => console.error("Reaction save error:", err));
  }, [storyReactions]);

  const handleReport = useCallback(async (storyId, reason) => {
    setHiddenStories(prev => new Set([...prev, storyId]));
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, reason }),
      });
      const data = await res.json();
      if (data.deleted) setStories(s => s.filter(story => story.id !== storyId));
    } catch (err) { console.error("Report error:", err); }
  }, []);

  const handleSaveStory = useCallback((storyId) => {
    const id = String(storyId);
    if (!authUser) {
      pendingSaveRef.current = id;
      setSignupReason("save");
      setPage("signup");
      return;
    }
    setSavedStories(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem("dt_saved_stories", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [authUser]);

  const [deletingStoryId, setDeletingStoryId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteDashStory = useCallback(async (storyId) => {
    setDeletingStoryId(storyId);
    try {
      const res = await fetch("/api/stories/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId }),
      });
      const data = await res.json();
      if (data.deleted) {
        setDashboardStories(prev => prev.filter(s => s.id !== storyId));
      }
    } catch (err) { console.error("Delete error:", err); }
    setDeletingStoryId(null);
    setConfirmDeleteId(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editedText.trim() || !submitResult?.storyId) return;
    setSavingEdit(true);
    try {
      await fetch("/api/stories/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: submitResult.storyId, rewritten_text: editedText, title: editedTitle }),
      });
      setSubmitResult(prev => ({ ...prev, story: { ...prev.story, text: editedText, title: editedTitle }, edited: true }));
      setEditingSubmission(false);
    } catch (err) { console.error("Edit error:", err); }
    setSavingEdit(false);
  }, [editedText, editedTitle, submitResult]);

  const handleRegenerate = useCallback(async (target) => {
    if (!submitResult?.storyId || !originalStoryText) return;
    if (target === "title") setRegeneratingTitle(true);
    else setRegeneratingStory(true);
    try {
      const res = await fetch("/api/stories/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: originalStoryText,
          currentTitle: submitResult.story.title,
          currentStory: submitResult.story.text,
          currentAuthor: submitResult.story.author,
          currentTheme: submitResult.story.theme,
          target,
          storyId: submitResult.storyId,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        if (target === "title" && data.title) {
          setSubmitResult(prev => ({ ...prev, story: { ...prev.story, title: data.title } }));
        } else if (target === "story" && data.rewritten) {
          setSubmitResult(prev => ({ ...prev, story: { ...prev.story, text: data.rewritten } }));
        }
      }
    } catch (err) { console.error("Regenerate error:", err); }
    if (target === "title") setRegeneratingTitle(false);
    else setRegeneratingStory(false);
  }, [submitResult, originalStoryText]);

  const renderAuthError = () => {
    if (!authError) return null;
    if (authError === "already_exists") {
      return (
        <div className="auth-error">
          An account with this email already exists. <span className="auth-switch-link" onClick={() => setPage("login")}>Log in instead</span>
        </div>
      );
    }
    return <div className="auth-error">{authError}</div>;
  };

  const startEditSubmission = () => {
    if (submitResult?.story) {
      setEditedText(submitResult.story.text);
      setEditedTitle(submitResult.story.title);
      setEditingSubmission(true);
    }
  };

  const PencilIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

  const renderSubmissionPreview = () => {
    if (!submitResult) return null;
    if (submitResult.type === "rejected") {
      return <div className="submit-result rejected"><div>{submitResult.message}</div></div>;
    }
    const s = submitResult.story;
    const themeClass = `theme-${s.theme?.toLowerCase().replace(/ /g, "-")}`;
    return (
      <div className="submission-preview">
        <div className="sp-header">
          <div className="sp-check"><CheckIcon /></div>
          <div className="sp-header-text">
            <div className="sp-title-text">{submitResult.edited ? "Story updated" : "Here's your story"}</div>
            <div className="sp-subtitle">{submitResult.edited ? "Your changes have been saved. The story is back in review with your edits." : "Submitted for review. Tap the pencil to edit the title or story."}</div>
          </div>
        </div>
        <div className="sp-card">
          <div className="sp-card-top">
            <span className={`story-card-theme ${themeClass}`}>{s.theme}</span>
            {!editingSubmission && (
              <button className="sp-edit-btn" onClick={startEditSubmission} title="Edit story"><PencilIcon /></button>
            )}
          </div>
          {editingSubmission ? (
            <>
              <input className="sp-title-input" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} placeholder="Story title" />
              <div className="sp-edit-area">
                <textarea className="sp-edit-textarea" value={editedText} onChange={e => setEditedText(e.target.value)} />
                <div className="sp-edit-actions">
                  <button className="sp-cancel" onClick={() => setEditingSubmission(false)}>Cancel</button>
                  <button className="sp-save" onClick={handleSaveEdit} disabled={savingEdit}>
                    {savingEdit ? <><span className="spinner" /> Saving...</> : "Save changes"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="sp-card-title">{s.title}</div>
              <div className="sp-card-text">{s.text}</div>
            </>
          )}
          <div className="sp-card-persona">— {s.author}</div>
        </div>
        <div className="sp-regen-row">
          <button className="sp-regen-btn" onClick={() => handleRegenerate("title")} disabled={regeneratingTitle || regeneratingStory}>
            {regeneratingTitle ? <><span className="spinner sp-spinner" /> Generating...</> : "🔄 New title"}
          </button>
          <button className="sp-regen-btn" onClick={() => handleRegenerate("story")} disabled={regeneratingTitle || regeneratingStory}>
            {regeneratingStory ? <><span className="spinner sp-spinner" /> Generating...</> : "🔄 New version"}
          </button>
        </div>
        {originalStoryText && (
          <div className="sp-original-section">
            <button className="sp-original-link" onClick={() => setShowOriginal(!showOriginal)}>
              {showOriginal ? "Hide original submission" : "📝 View your original submission"}
            </button>
            {showOriginal && (
              <div className="sp-original-text">{originalStoryText}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Computed ──
  const visibleStories = stories.filter(s => !hiddenStories.has(s.id));
  const now = new Date();
  // Cutoff = most recent Friday 6am PT (1pm UTC)
  // Only stories published by the Friday cron go in "This week's drop"
  const getDropCutoff = () => {
    const d = new Date(now);
    d.setUTCHours(13, 0, 0, 0);
    const day = d.getUTCDay();
    const diff = (day + 2) % 7;
    d.setUTCDate(d.getUTCDate() - diff);
    if (d > now) d.setUTCDate(d.getUTCDate() - 7);
    return d.toISOString();
  };
  const dropCutoff = getDropCutoff();
  const thisWeekStories = visibleStories.filter(s => s.publishedAt && s.publishedAt >= dropCutoff);
  const sortByReactions = (arr) => [...arr].sort((a, b) => {
    const totalA = a._sortScore != null ? a._sortScore : Object.values(a.reactions || {}).reduce((sum, n) => sum + n, 0);
    const totalB = b._sortScore != null ? b._sortScore : Object.values(b.reactions || {}).reduce((sum, n) => sum + n, 0);
    return totalB - totalA;
  });
  const homeStories = sortByReactions(thisWeekStories).slice(0, 4);

  const searchFilter = (arr) => {
    if (!searchQuery.trim()) return arr;
    const searchTerms = expandSearch(searchQuery);
    return arr.filter(s => {
      const tagStr = Array.isArray(s.tags) ? s.tags.join(" ") : (s.tags || "");
      const searchable = `${s.title} ${s.text} ${s.author} ${s.theme} ${tagStr}`.toLowerCase();
      return searchTerms.some(term => searchable.includes(term));
    });
  };
  const themeFilter = (arr) => filter === "All" ? arr : arr.filter(s => s.theme === filter);
  const shuffleWithWeight = useCallback((arr, seed) => {
    if (!arr.length) return arr;
    const seededRandom = (i) => {
      let x = Math.sin(seed * 9301 + i * 49297 + 233280) * 49297;
      return x - Math.floor(x);
    };
    return [...arr].map((item, i) => {
      const reactions = item._sortScore != null ? item._sortScore : Object.values(item.reactions || {}).reduce((sum, n) => sum + n, 0);
      const weight = Math.log2(reactions + 2);
      const noise = seededRandom(i) * 4;
      return { ...item, _shuffleScore: weight + noise };
    }).sort((a, b) => b._shuffleScore - a._shuffleScore);
  }, []);

  const filteredThisWeek = sortByReactions(searchFilter(themeFilter(thisWeekStories)));
  const thisWeekIds = new Set(thisWeekStories.map(s => s.id));
  const olderStories = visibleStories.filter(s => !thisWeekIds.has(s.id));
  const filteredAll = searchQuery.trim() || filter !== "All"
    ? sortByReactions(searchFilter(themeFilter(searchQuery.trim() ? visibleStories : olderStories)))
    : shuffleWithWeight(searchFilter(themeFilter(olderStories)), libraryShuffleKey);
  const allThemes = ["All", ...THEMES];

  // ── Dashboard helpers ──
  const getStatusColor = (status) => {
    switch (status) {
      case "published": return { bg: "#DCFCE7", color: "#166534" };
      case "pending": return { bg: "#FEF3C7", color: "#92400E" };
      case "approved": return { bg: "#DBEAFE", color: "#1E40AF" };
      case "queued": return { bg: "#E0E7FF", color: "#4338CA" };
      case "rejected": return { bg: "#FEE2E2", color: "#991B1B" };
      default: return { bg: "#F1F5F9", color: "#475569" };
    }
  };

  const getTotalReactions = (reactions) => {
    if (!reactions || typeof reactions !== "object") return 0;
    return Object.values(reactions).reduce((sum, n) => sum + n, 0);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=League+Spartan:wght@700;800;900&display=swap');

    :root {
      --blue: #2563EB;
      --blue-light: #DBEAFE;
      --blue-pale: #EFF6FF;
      --blue-dark: #1E40AF;
      --blue-deep: #1E3A5F;
      --black: #0F172A;
      --gray: #64748B;
      --gray-light: #94A3B8;
      --border: #E2E8F0;
      --bg: #FFFFFF;
      --font: 'DM Sans', system-ui, sans-serif;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--bg); color: var(--black); }

    .fade-up { opacity: 0; transform: translateY(16px); animation: fadeUp 0.6s ease forwards; }
    .d1 { animation-delay: 0.08s; } .d2 { animation-delay: 0.16s; }
    .d3 { animation-delay: 0.24s; } .d4 { animation-delay: 0.32s; }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
    @keyframes float1 { 0%,100% { transform: rotate(-3deg) translateY(0); } 50% { transform: rotate(-3deg) translateY(-8px); } }
    @keyframes float2 { 0%,100% { transform: rotate(2.5deg) translateY(0); } 50% { transform: rotate(2.5deg) translateY(-10px); } }
    @keyframes float3 { 0%,100% { transform: rotate(-1.5deg) translateY(0); } 50% { transform: rotate(-1.5deg) translateY(-6px); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Nav ── */
    .nav-wrapper { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(226,232,240,0.5); }
    .nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; max-width: 1280px; margin: 0 auto; }
    .nav-logo { display: flex; flex-direction: column; cursor: pointer; line-height: 1; }
    .nav-logo-text { font-family: 'League Spartan', var(--font); font-size: 34px; font-weight: 800; color: var(--black); letter-spacing: -0.03em; }
    .nav-logo-tagline { font-family: var(--font); font-size: 13px; font-weight: 400; color: var(--blue); letter-spacing: 0.02em; font-style: italic; margin-top: 1px; }
    .nav-right { display: flex; align-items: center; gap: 20px; }
    .nav-link { font-family: var(--font); font-size: 14px; font-weight: 500; color: var(--gray); cursor: pointer; text-decoration: none; transition: color 0.2s; }
    .nav-link:hover { color: var(--black); }
    .nav-user-btn { font-family: var(--font); font-size: 14px; font-weight: 500; color: var(--gray); cursor: pointer; display: flex; align-items: center; gap: 6px; background: none; border: 1.5px solid var(--border); padding: 8px 16px; border-radius: 10px; transition: all 0.2s; }
    .nav-user-btn:hover { border-color: var(--blue-light); color: var(--black); }
    .nav-signup { font-family: var(--font); font-size: 14px; font-weight: 600; color: var(--blue); background: none; padding: 10px 22px; border-radius: 14px; border: 2px solid var(--blue); cursor: pointer; transition: all 0.2s; }
    .nav-signup:hover { background: var(--blue); color: white; }
    .nav-share { font-family: var(--font); font-size: 14px; font-weight: 600; color: white; background: var(--black); padding: 12px 24px; border-radius: 14px; border: none; cursor: pointer; transition: all 0.2s; }
    .nav-share:hover { background: #1E293B; }
    .nav-hamburger { display: none; background: none; border: none; color: var(--black); cursor: pointer; padding: 4px; }
    .mobile-menu { display: none; }

    /* ── Hero ── */
    .hero { max-width: 1280px; margin: 0 auto; padding: 80px 48px 100px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--blue); margin-bottom: 20px; letter-spacing: 0.01em; background: var(--blue-pale); padding: 10px 20px; border-radius: 100px; }
    .eyebrow-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); }
    .hero h1 { font-family: var(--font); font-size: 60px; font-weight: 700; line-height: 1.05; letter-spacing: -0.03em; color: var(--black); margin-bottom: 24px; }
    .hero h1 em { color: var(--blue); font-style: italic; }
    .hero-blue { color: var(--blue); }
    .hero-sub { font-family: var(--font); font-size: 18px; color: var(--gray); line-height: 1.6; margin-bottom: 36px; font-weight: 400; max-width: 460px; }
    .hero-email { display: flex; gap: 10px; margin-bottom: 20px; }
    .hero-input { flex: 1; padding: 16px 20px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); background: white; color: var(--black); }
    .hero-input::placeholder { color: var(--gray-light); }
    .hero-input:focus { outline: none; border-color: var(--blue); }
    .hero-btn { padding: 16px 32px; background: var(--blue); color: white; border: none; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font); white-space: nowrap; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .hero-btn:hover { background: var(--blue-dark); transform: translateY(-1px); }
    .hero-subbed { display: flex; align-items: center; gap: 10px; padding: 16px 24px; background: var(--blue-pale); border-radius: 14px; font-size: 15px; font-weight: 600; color: var(--blue-dark); font-family: var(--font); }
    .hero-subbed-success { padding: 16px 24px; background: #DCFCE7; border-radius: 14px; font-size: 15px; font-weight: 600; color: #166534; font-family: var(--font); line-height: 1.5; }

    /* ── Floating cards ── */
    .hero-cards { position: relative; height: 520px; }
    .float-card { position: absolute; background: white; border-radius: 20px; padding: 22px; width: 280px; box-shadow: 0 8px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.04); }
    .float-card.c1 { top: 0; left: 10px; animation: float1 4s ease-in-out infinite; z-index: 2; }
    .float-card.c2 { top: 180px; right: 0; animation: float2 5s ease-in-out infinite; z-index: 3; }
    .float-card.c3 { bottom: 10px; left: 40px; animation: float3 4.5s ease-in-out infinite; z-index: 1; }
    .fc-tag { display: inline-block; font-family: var(--font); font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 100px; margin-bottom: 12px; }
    .c1 .fc-tag { background: var(--blue-light); color: var(--blue-dark); }
    .c2 .fc-tag { background: #DCFCE7; color: #166534; }
    .c3 .fc-tag { background: #F3E8FF; color: #7C3AED; }
    .fc-title { font-family: var(--font); font-size: 16px; font-weight: 700; color: var(--black); margin-bottom: 8px; }
    .fc-text { font-family: var(--font); font-size: 13px; color: var(--gray); line-height: 1.55; margin-bottom: 12px; }
    .fc-reactions { display: flex; gap: 12px; font-family: var(--font); font-size: 12px; color: var(--gray-light); font-weight: 500; }

    /* ── Home sections ordering ── */
    .home-sections { display: flex; flex-direction: column; }
    .home-submit { order: 1; }
    .home-stories { order: 2; }
    @media (min-width: 769px) { .home-submit { order: 2; } .home-stories { order: 1; } }

    /* ── Stories ── */
    .stories-section { max-width: 1280px; margin: 0 auto; padding: 0 48px 100px; }
    .stories-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px; }
    .stories-title { font-family: var(--font); font-size: 36px; font-weight: 700; letter-spacing: -0.02em; color: var(--black); }
    .rainbow-accent { height: 4px; width: 60px; border-radius: 4px; margin-top: 10px; background: linear-gradient(90deg, #EF4444, #F59E0B, #3B82F6, #8B5CF6, #EC4899); }
    .stories-link { font-family: var(--font); font-size: 14px; font-weight: 600; color: var(--black); cursor: pointer; display: flex; align-items: center; gap: 6px; text-decoration: underline; text-underline-offset: 3px; }
    .stories-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

    /* ── Story Card ── */
    .story-card { background: white; border-radius: 20px; padding: 28px; transition: all 0.3s; border: 1px solid var(--border); }
    .story-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.06); border-color: transparent; }
    .story-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .story-header-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .story-card-title { font-family: var(--font); font-size: 20px; font-weight: 700; color: var(--black); line-height: 1.25; }
    .story-card-trending { position: relative; }
    .trending-badge { display: inline-flex; align-items: center; flex-shrink: 0; gap: 3px; font-size: 11px; font-weight: 600; color: #D97706; background: #FFFBEB; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
    .story-card-dots { color: var(--gray-light); font-size: 18px; cursor: pointer; background: none; border: none; padding: 4px 8px; border-radius: 8px; font-family: var(--font); }
    .story-card-dots:hover { background: var(--blue-pale); }
    .story-menu-wrap { position: relative; }
    .story-menu-dropdown { position: absolute; top: 100%; right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); border: 1px solid var(--border); padding: 4px; min-width: 180px; z-index: 50; }
    .story-menu-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; border: none; background: none; font-family: var(--font); font-size: 13px; color: var(--gray); cursor: pointer; border-radius: 8px; transition: background 0.1s; }
    .story-menu-item:hover { background: var(--blue-pale); color: var(--blue); }
    .story-card-theme { display: inline-block; font-family: var(--font); font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 100px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.04em; }

    .theme-first-dates { background: #DCFCE7; color: #166534; }
    .theme-meet-cutes { background: #FEF3C7; color: #92400E; }
    .theme-awkward-moments { background: #F3E8FF; color: #7C3AED; }
    .theme-dating-app-disasters { background: #FFE4E6; color: #BE123C; }
    .theme-situationships { background: #E0F2FE; color: #0369A1; }
    .theme-meeting-the-family { background: #FFF7ED; color: #C2410C; }
    .story-card-text { font-family: var(--font); font-size: 15px; color: var(--gray); line-height: 1.65; margin-bottom: 16px; }
    .story-card-persona { font-family: var(--font); font-size: 14px; font-weight: 600; font-style: italic; color: var(--blue); margin-bottom: 16px; }
    .story-card-divider { height: 1px; background: var(--border); margin-bottom: 16px; }
    .story-card-reactions { display: flex; gap: 8px; }
    .story-reaction { min-width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border); background: white; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 18px; cursor: pointer; transition: all 0.2s; padding: 0 10px; }
    .story-reaction:hover { background: var(--blue-pale); border-color: var(--blue-light); transform: scale(1.05); }
    .story-reaction.active { background: var(--blue-pale); border-color: var(--blue); }
    .reaction-count { font-size: 12px; font-weight: 600; color: var(--gray); font-family: var(--font); }
    .story-menu-item.share-item:hover { background: var(--blue-pale); color: var(--blue); }
    .story-menu-item.save-item:hover { background: #FFFBEB; color: #D97706; }
    .story-menu-item.report-item:hover { background: #FEF2F2; color: #DC2626; }

    /* ── Report Modal ── */
    .report-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .report-modal { background: white; border-radius: 20px; padding: 32px; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); font-family: var(--font); }
    .report-modal h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: var(--black); }
    .report-sub { font-size: 14px; color: var(--gray); margin-bottom: 20px; }
    .report-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .report-option { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: 1.5px solid var(--border); background: white; cursor: pointer; font-family: var(--font); font-size: 14px; color: var(--black); transition: all 0.15s; }
    .report-option:hover { border-color: var(--blue-light); }
    .report-option.selected { border-color: var(--blue); background: var(--blue-pale); }
    .ro-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border); flex-shrink: 0; }
    .report-option.selected .ro-radio { border-color: var(--blue); background: var(--blue); box-shadow: inset 0 0 0 3px white; }
    .report-actions { display: flex; gap: 10px; }
    .report-cancel { flex: 1; padding: 14px; border-radius: 12px; border: 1.5px solid var(--border); background: white; font-family: var(--font); font-size: 14px; font-weight: 600; color: var(--gray); cursor: pointer; }
    .report-submit { flex: 1; padding: 14px; border-radius: 12px; border: none; background: #EF4444; color: white; font-family: var(--font); font-size: 14px; font-weight: 600; cursor: pointer; }
    .report-submit:disabled { opacity: 0.4; cursor: not-allowed; }
    .report-success { text-align: center; }
    .report-success-icon { width: 48px; height: 48px; border-radius: 50%; background: #DCFCE7; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #166534; }

    /* ── Share Toast ── */
    .share-toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: var(--black); color: white; padding: 14px 24px; border-radius: 12px; font-family: var(--font); font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 300; box-shadow: 0 8px 30px rgba(0,0,0,0.2); animation: toastIn 0.3s ease, toastOut 0.3s ease 2.2s forwards; }
    .share-toast svg { width: 16px; height: 16px; stroke: #4ADE80; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }

    /* ── Submit Section (homepage) ── */
    .submit-section { max-width: 1280px; margin: 0 auto; padding: 0 48px 100px; }
    .submit-inner { background: var(--blue-pale); border-radius: 24px; padding: 48px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; align-items: start; }
    .submit-title { font-family: var(--font); font-size: 32px; font-weight: 700; color: var(--black); letter-spacing: -0.02em; margin-bottom: 12px; }
    .submit-sub { font-family: var(--font); font-size: 17px; color: var(--gray); line-height: 1.6; }
    .submit-form-area { position: relative; }
    .submit-textarea { width: 100%; padding: 18px; padding-bottom: 36px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); background: white; color: var(--black); resize: none; line-height: 1.5; min-height: 140px; }
    .submit-char-count { position: absolute; bottom: 14px; right: 16px; font-family: var(--font); font-size: 12px; color: var(--gray-light); }
    .submit-char-count.warn { color: #F59E0B; }
    .submit-char-count.over { color: #EF4444; }
    .submit-textarea::placeholder { color: var(--gray-light); }
    .submit-textarea:focus { outline: none; border-color: var(--blue); }
    .submit-row { display: flex; justify-content: flex-end; align-items: center; margin-top: 12px; }
    .submit-trust { font-family: var(--font); font-size: 13px; color: var(--gray); margin-top: 16px; text-align: center; line-height: 1.5; }
    .submit-btn { padding: 14px 28px; background: var(--black); color: white; border: none; border-radius: 14px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; width: 100%; }
    .submit-btn:hover { background: #1E293B; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .submit-result { margin-top: 16px; padding: 16px; border-radius: 12px; font-family: var(--font); font-size: 14px; line-height: 1.5; }
    .submit-result.approved { background: #DCFCE7; color: #166534; }
    .submit-result.rejected { background: #FEF2F2; color: #991B1B; }

    /* ── Submission Preview ── */
    .submission-preview { margin-top: 20px; }
    .sp-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
    .sp-check { width: 36px; height: 36px; border-radius: 50%; background: #DCFCE7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #166534; }
    .sp-check svg { width: 16px; height: 16px; }
    .sp-header-text { flex: 1; }
    .sp-title-text { font-family: var(--font); font-size: 16px; font-weight: 700; color: var(--black); margin-bottom: 2px; }
    .sp-subtitle { font-family: var(--font); font-size: 13px; color: var(--gray); line-height: 1.4; }
    .sp-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .sp-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .sp-edit-btn { background: none; border: none; color: var(--gray-light); cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; }
    .sp-edit-btn:hover { color: var(--blue); background: var(--blue-pale); }
    .sp-card-title { font-family: var(--font); font-size: 18px; font-weight: 700; color: var(--black); margin-bottom: 10px; }
    .sp-card-text { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 12px; }
    .sp-card-persona { font-family: var(--font); font-size: 13px; font-weight: 600; font-style: italic; color: var(--blue); }
    .sp-edit-area { margin-bottom: 12px; }
    .sp-edit-textarea { width: 100%; padding: 14px; border: 2px solid var(--blue-light); border-radius: 12px; font-size: 14px; font-family: var(--font); color: var(--black); resize: vertical; line-height: 1.5; min-height: 100px; background: var(--blue-pale); }
    .sp-edit-textarea:focus { outline: none; border-color: var(--blue); }
    .sp-edit-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; }
    .sp-cancel { padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); background: white; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--gray); cursor: pointer; }
    .sp-save { padding: 8px 16px; border-radius: 10px; border: none; background: var(--blue); color: white; font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .sp-save:hover { background: var(--blue-dark); }
    .sp-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .sp-title-input { width: 100%; padding: 10px 14px; border: 2px solid var(--blue-light); border-radius: 10px; font-size: 18px; font-family: var(--font); font-weight: 700; color: var(--black); background: var(--blue-pale); margin-bottom: 10px; }
    .sp-title-input:focus { outline: none; border-color: var(--blue); }
    .sp-original-section { margin-top: 16px; }
    .sp-original-link { background: none; border: none; color: var(--blue); font-family: var(--font); font-size: 14px; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 2px; }
    .sp-original-link:hover { opacity: 0.8; }
    .sp-original-text { margin-top: 12px; padding: 16px; background: #F8FAFC; border: 1px solid var(--border); border-radius: 12px; font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; white-space: pre-wrap; }
    .sp-regen-row { display: flex; gap: 8px; margin-top: 12px; }
    .sp-regen-btn { padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--border); background: white; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--gray); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
    .sp-regen-btn:hover { border-color: var(--blue-light); color: var(--blue); background: var(--blue-pale); }
    .sp-regen-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .sp-spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.1); border-top-color: var(--blue); }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }

    /* ── Auth Pages (Login / Signup) ── */
    .auth-page { max-width: 440px; margin: 0 auto; padding: 80px 24px; }
    .auth-card { background: white; border: 1px solid var(--border); border-radius: 20px; padding: 40px 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
    .auth-logo { font-family: 'League Spartan', var(--font); font-size: 28px; font-weight: 800; color: var(--black); letter-spacing: -0.03em; text-align: center; margin-bottom: 8px; }
    .auth-title { font-family: var(--font); font-size: 24px; font-weight: 700; color: var(--black); text-align: center; margin-bottom: 8px; }
    .auth-subtitle { font-family: var(--font); font-size: 14px; color: var(--gray); text-align: center; margin-bottom: 28px; line-height: 1.5; }
    .auth-label { display: block; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--black); margin-bottom: 6px; }
    .auth-input { width: 100%; padding: 14px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 15px; font-family: var(--font); color: var(--black); margin-bottom: 16px; }
    .auth-input::placeholder { color: var(--gray-light); }
    .auth-input:focus { outline: none; border-color: var(--blue); }
    .auth-btn { width: 100%; padding: 16px; background: var(--blue); color: white; border: none; border-radius: 12px; font-family: var(--font); font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
    .auth-btn:hover { background: var(--blue-dark); }
    .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-error { background: #FEF2F2; color: #991B1B; padding: 12px 16px; border-radius: 10px; font-family: var(--font); font-size: 13px; margin-bottom: 16px; line-height: 1.4; }
    .auth-switch { font-family: var(--font); font-size: 14px; color: var(--gray); text-align: center; }
    .auth-switch-link { color: var(--blue); font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
    .auth-forgot { font-family: var(--font); font-size: 13px; color: var(--blue); font-weight: 500; cursor: pointer; text-align: right; margin-top: -4px; margin-bottom: 8px; }
    .auth-forgot:hover { text-decoration: underline; text-underline-offset: 2px; }
    .auth-success { text-align: center; padding: 20px 0; }
    .auth-success-icon { font-size: 40px; margin-bottom: 16px; }
    .auth-success-title { font-family: var(--font); font-size: 22px; font-weight: 700; color: var(--black); margin-bottom: 8px; }
    .auth-success-sub { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 24px; }
    .auth-success-sub strong { color: var(--black); }
    .auth-btn-secondary { width: 100%; padding: 14px; background: white; border: 1.5px solid var(--border); border-radius: 12px; font-family: var(--font); font-size: 15px; font-weight: 600; color: var(--black); cursor: pointer; transition: all 0.2s; }
    .auth-btn-secondary:hover { border-color: var(--blue); color: var(--blue); }
    .auth-divider { display: flex; align-items: center; gap: 16px; margin: 20px 0; }
    .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
    .auth-divider-text { font-family: var(--font); font-size: 12px; color: var(--gray-light); font-weight: 500; }

    /* ── Dashboard ── */
    .dash-page { max-width: 960px; margin: 0 auto; padding: 60px 48px 100px; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
    .dash-title { font-family: var(--font); font-size: 36px; font-weight: 700; color: var(--black); letter-spacing: -0.02em; }
    .dash-email { font-family: var(--font); font-size: 14px; color: var(--gray); }
    .dash-logout { font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--gray); background: none; border: 1.5px solid var(--border); padding: 8px 18px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .dash-logout:hover { border-color: #EF4444; color: #EF4444; }
    .dash-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
    .dash-stat { background: var(--blue-pale); border-radius: 16px; padding: 24px; text-align: center; }
    .dash-stat-num { font-family: var(--font); font-size: 32px; font-weight: 700; color: var(--blue); margin-bottom: 4px; }
    .dash-stat-label { font-family: var(--font); font-size: 13px; color: var(--gray); font-weight: 500; }
    .dash-section-title { font-family: var(--font); font-size: 24px; font-weight: 700; color: var(--black); margin-bottom: 16px; }
    .dash-story { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 12px; transition: all 0.2s; }
    .dash-story:hover { border-color: var(--blue-light); box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .dash-story-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .dash-story-title { font-family: var(--font); font-size: 17px; font-weight: 700; color: var(--black); }
    .dash-story-status { font-family: var(--font); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.04em; }
    .dash-story-text { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 12px; }
    .dash-story-meta { display: flex; gap: 20px; font-family: var(--font); font-size: 13px; color: var(--gray-light); }
    .dash-story-meta span { display: flex; align-items: center; gap: 4px; }
    .dash-delete-row { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
    .dash-delete-btn { background: none; border: none; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--gray-light); cursor: pointer; padding: 0; }
    .dash-delete-btn:hover { color: #DC2626; }
    .dash-delete-confirm { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .dash-delete-confirm-text { font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--black); }
    .dash-delete-yes { padding: 6px 14px; border-radius: 8px; border: none; background: #DC2626; color: white; font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; }
    .dash-delete-yes:disabled { opacity: 0.5; cursor: not-allowed; }
    .dash-delete-no { padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border); background: white; color: var(--gray); font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; }
    .dash-story-reactions { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .dash-reaction-pill { display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: var(--blue-pale); border-radius: 100px; font-size: 14px; }
    .dash-reaction-count { font-family: var(--font); font-size: 13px; font-weight: 700; color: var(--black); }
    .dash-reaction-total { font-family: var(--font); font-size: 12px; color: var(--gray-light); font-weight: 500; margin-left: 4px; }
    .dash-share-link { display: flex; align-items: center; gap: 4px; color: var(--blue); font-weight: 600; cursor: pointer; margin-left: auto; transition: opacity 0.2s; }
    .dash-share-link:hover { opacity: 0.7; }
    .dash-share-link svg { width: 14px; height: 14px; stroke: var(--blue); }
    .dash-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .dash-filter { font-family: var(--font); font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 100px; border: 1.5px solid var(--border); background: white; color: var(--gray); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .dash-filter:hover { border-color: var(--blue-light); color: var(--black); }
    .dash-filter.active { background: var(--black); color: white; border-color: var(--black); }
    .dash-filter-count { font-size: 11px; font-weight: 700; background: rgba(0,0,0,0.08); padding: 2px 7px; border-radius: 100px; }
    .dash-filter.active .dash-filter-count { background: rgba(255,255,255,0.2); }
    .dash-empty { text-align: center; padding: 60px 20px; }
    .dash-empty-icon { font-size: 40px; margin-bottom: 12px; }
    .dash-empty-title { font-family: var(--font); font-size: 20px; font-weight: 700; color: var(--black); margin-bottom: 8px; }
    .dash-empty-sub { font-family: var(--font); font-size: 14px; color: var(--gray); margin-bottom: 20px; line-height: 1.5; }
    .dash-empty-btn { padding: 14px 28px; background: var(--blue); color: white; border: none; border-radius: 12px; font-family: var(--font); font-size: 15px; font-weight: 600; cursor: pointer; }
    .dash-empty-btn:hover { background: var(--blue-dark); }
    .dash-loading { text-align: center; padding: 60px; font-family: var(--font); color: var(--gray); }
    .dash-welcome-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
    .dash-welcome { background: white; border-radius: 20px; padding: 40px 32px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .dash-welcome-emoji { font-size: 48px; margin-bottom: 16px; }
    .dash-welcome-title { font-family: var(--font); font-size: 22px; font-weight: 700; color: var(--black); margin-bottom: 12px; }
    .dash-welcome-text { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 24px; }

    /* ── How it works ── */
    .how-section { background: var(--blue); padding: 80px 48px; }
    .how-inner { max-width: 1280px; margin: 0 auto; }
    .how-title { font-family: var(--font); font-size: 36px; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 48px; }
    .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .how-card { background: rgba(255,255,255,0.12); border-radius: 24px; padding: 36px 28px; }
    .how-num { font-family: var(--font); font-size: 44px; font-weight: 700; color: rgba(255,255,255,0.2); margin-bottom: 16px; line-height: 1; }
    .how-card h3 { font-family: var(--font); font-size: 18px; font-weight: 700; color: white; margin-bottom: 10px; }
    .how-card p { font-family: var(--font); font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; }

    /* ── CTA ── */
    .cta-section { max-width: 1280px; margin: 0 auto; padding: 100px 48px; text-align: center; }
    .cta-title { font-family: var(--font); font-size: 44px; font-weight: 700; letter-spacing: -0.03em; color: var(--black); margin-bottom: 16px; }
    .cta-sub { font-family: var(--font); font-size: 17px; color: var(--gray); margin-bottom: 36px; }
    .cta-email { display: inline-flex; gap: 10px; max-width: 480px; width: 100%; }
    .cta-input { flex: 1; padding: 16px 20px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); color: var(--black); }
    .cta-input::placeholder { color: var(--gray-light); }
    .cta-input:focus { outline: none; border-color: var(--blue); }
    .cta-btn { padding: 16px 32px; background: var(--blue); color: white; border: none; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font); }
    .cta-btn:hover { background: var(--blue-dark); }

    /* ── Library ── */
    .library-page { max-width: 1280px; margin: 0 auto; padding: 60px 48px 100px; }
    .library-header { margin-bottom: 40px; }
    .library-title { font-family: var(--font); font-size: 44px; font-weight: 700; color: var(--black); letter-spacing: -0.03em; margin-bottom: 12px; }
    .library-sub { font-family: var(--font); font-size: 17px; color: var(--gray); }
    .library-section-title { font-family: var(--font); font-size: 30px; font-weight: 700; color: var(--black); margin-bottom: 20px; }
    .library-divider { height: 1px; background: var(--border); margin: 48px 0; }
    .library-search { position: relative; margin-bottom: 16px; }
    .library-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--gray-light); pointer-events: none; }
    .library-search-input { width: 100%; padding: 14px 16px 14px 44px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); background: white; color: var(--black); transition: border-color 0.2s; }
    .library-search-input::placeholder { color: var(--gray-light); }
    .library-search-input:focus { outline: none; border-color: var(--blue); }
    .library-search-clear { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: var(--border); border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray); font-size: 12px; padding: 0; }
    .library-search-clear:hover { background: var(--gray-light); color: white; }
    .library-filters { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .library-filter { font-family: var(--font); font-size: 13px; font-weight: 600; padding: 8px 18px; border-radius: 100px; border: 1.5px solid var(--border); background: white; color: var(--gray); cursor: pointer; transition: all 0.2s; }
    .library-filter:hover { border-color: var(--blue-light); color: var(--black); }
    .library-filter.active { background: var(--blue); color: white; border-color: var(--blue); }
    .library-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .library-empty { grid-column: 1 / -1; text-align: center; padding: 48px; font-family: var(--font); font-size: 15px; color: var(--gray-light); }

    /* ── Subscribe Page ── */
    .subscribe-page { max-width: 520px; margin: 0 auto; padding: 80px 24px; text-align: center; }
    .subscribe-heart { width: 72px; height: 72px; border-radius: 50%; background: var(--blue-pale); display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; }
    .subscribe-page h1 { font-family: var(--font); font-size: 40px; font-weight: 700; letter-spacing: -0.03em; color: var(--black); margin-bottom: 16px; }
    .subscribe-page h1 em { color: var(--blue); font-style: italic; }
    .subscribe-page-sub { font-family: var(--font); font-size: 17px; color: var(--gray); line-height: 1.6; margin-bottom: 32px; }
    .subscribe-page-input { width: 100%; padding: 18px 20px; border: 2px solid var(--border); border-radius: 14px; font-size: 16px; font-family: var(--font); color: var(--black); margin-bottom: 12px; }
    .subscribe-page-input::placeholder { color: var(--gray-light); }
    .subscribe-page-input:focus { outline: none; border-color: var(--blue); }
    .subscribe-page-btn { width: 100%; padding: 18px; background: var(--blue); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: var(--font); margin-bottom: 16px; }
    .subscribe-page-btn:hover { background: var(--blue-dark); }
    .subscribe-page-fine { font-family: var(--font); font-size: 13px; color: var(--gray-light); }

    /* ── Submit Page ── */
    .submit-page { max-width: 560px; margin: 0 auto; padding: 60px 24px; }
    .submit-page-rainbow { height: 5px; border-radius: 14px 14px 0 0; background: linear-gradient(90deg, #EF4444, #F59E0B, #3B82F6, #8B5CF6, #EC4899); }
    .submit-page-card { background: white; border-radius: 0 0 20px 20px; padding: 48px 36px; border: 1px solid var(--border); border-top: none; box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
    .submit-page h1 { font-family: var(--font); font-size: 36px; font-weight: 700; letter-spacing: -0.03em; color: var(--black); margin-bottom: 8px; }
    .submit-page-sub { font-family: var(--font); font-size: 15px; color: var(--gray); margin-bottom: 28px; line-height: 1.5; }
    .submit-page-form { position: relative; margin-bottom: 12px; }
    .submit-page-textarea { width: 100%; padding: 18px; padding-bottom: 36px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-family: var(--font); background: var(--blue-pale); color: var(--black); resize: vertical; line-height: 1.5; min-height: 180px; }
    .submit-page-textarea::placeholder { color: var(--gray-light); }
    .submit-page-textarea:focus { outline: none; border-color: var(--blue); }
    .submit-page-char { position: absolute; bottom: 14px; right: 16px; font-family: var(--font); font-size: 12px; color: var(--gray-light); }
    .submit-page-char.warn { color: #F59E0B; }
    .submit-page-char.over { color: #EF4444; }
    .submit-page-btn { width: 100%; padding: 18px; background: var(--black); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: var(--font); margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .submit-page-btn:hover { background: #1E293B; }
    .submit-page-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .submit-page-fine { font-family: var(--font); font-size: 13px; color: var(--gray-light); text-align: center; }

    /* ── Post-Submit Inline Signup ── */
    .post-submit-signup { margin-top: 24px; background: white; border: 2px solid var(--border); border-radius: 16px; overflow: hidden; }
    .post-submit-signup-rainbow { height: 5px; background: linear-gradient(90deg, #EF4444, #F59E0B, #3B82F6, #8B5CF6, #EC4899); }
    .post-submit-signup-inner { padding: 28px 24px; }
    .post-submit-signup-header { margin-bottom: 20px; }
    .post-submit-signup-title { font-family: var(--font); font-size: 20px; font-weight: 700; color: var(--black); margin-bottom: 6px; }
    .post-submit-signup-sub { font-family: var(--font); font-size: 14px; color: var(--gray); line-height: 1.5; }
    .post-submit-signup .auth-input { background: white; border: 2px solid var(--border); }
    .post-submit-signup .auth-switch { margin-top: 4px; }

    .submit-another-btn { width: 100%; margin-top: 20px; padding: 16px; background: var(--black); border: none; border-radius: 14px; font-family: var(--font); font-size: 15px; font-weight: 700; color: white; cursor: pointer; transition: all 0.2s; }
    .submit-another-btn:hover { background: #1E293B; }
    .submit-page-result { margin-top: 16px; padding: 16px; border-radius: 12px; font-family: var(--font); font-size: 14px; line-height: 1.5; }
    .submit-page-result.approved { background: #DCFCE7; color: #166534; }
    .submit-page-result.rejected { background: #FEF2F2; color: #991B1B; }

    /* ── Legal Pages ── */
    .legal-page { max-width: 720px; margin: 0 auto; padding: 48px 48px 64px; font-family: var(--font); color: var(--black); line-height: 1.7; }
    .legal-page h1 { font-family: 'League Spartan', var(--font); font-size: 32px; font-weight: 800; margin-bottom: 4px; }
    .legal-page .legal-date { font-size: 14px; color: var(--gray); margin-bottom: 32px; }
    .legal-page h2 { font-size: 18px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; }
    .legal-page h3 { font-size: 16px; font-weight: 600; margin-top: 24px; margin-bottom: 8px; }
    .legal-page p { font-size: 14px; color: #374151; margin-bottom: 12px; }
    .legal-page a { color: var(--blue); text-decoration: none; }
    .legal-page a:hover { text-decoration: underline; }

    /* ── Footer ── */
    .footer { background: #1a2332; color: #fff; padding: 48px 48px 0; }
    .footer-inner { max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; gap: 48px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .footer-brand { max-width: 360px; }
    .footer-logo { font-family: 'League Spartan', var(--font); font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.03em; margin-bottom: 12px; }
    .footer-tagline { font-family: var(--font); font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; }
    .footer-links-group { display: flex; gap: 64px; }
    .footer-col { display: flex; flex-direction: column; gap: 10px; }
    .footer-col-title { font-family: var(--font); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.9); margin-bottom: 4px; }
    .footer-link { font-family: var(--font); font-size: 14px; color: rgba(255,255,255,0.5); cursor: pointer; text-decoration: none; transition: color 0.2s; background: none; border: none; padding: 0; text-align: left; }
    .footer-link:hover { color: #fff; }
    .footer-bottom { max-width: 1280px; margin: 0 auto; padding: 20px 0; }
    .footer-copy { font-family: var(--font); font-size: 13px; color: rgba(255,255,255,0.35); }

    /* ── Mobile ── */
    @media (max-width: 768px) {
      .nav { padding: 16px 20px; }
      .nav-link { display: none; }
      .nav-share { display: none; }
      .nav-signup { display: none; }
      .nav-user-btn { display: none; }
      .nav-hamburger { display: block; }
      .mobile-menu { display: flex; flex-direction: column; padding: 8px 20px 16px; border-top: 1px solid var(--border); position: absolute; top: 100%; left: 0; right: 0; background: white; z-index: 999; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      .mobile-menu-item { width: 100%; padding: 14px 0; border: none; background: none; font-family: var(--font); font-size: 16px; font-weight: 500; color: var(--gray); cursor: pointer; text-align: left; border-bottom: 1px solid var(--border); }
      .mobile-menu-item:last-child { border-bottom: none; }
      .mobile-menu-item:hover { color: var(--black); }
      .mobile-menu-item.primary { color: var(--blue); font-weight: 700; }

      .hero { grid-template-columns: 1fr; padding: 40px 20px 32px; gap: 32px; }
      .hero h1 { font-size: 36px; }
      .hero-sub { font-size: 16px; margin-bottom: 28px; }
      .hero-eyebrow { font-size: 12px; padding: 8px 16px; }
      .hero-cards { height: 320px; }
      .float-card { width: 220px; padding: 16px; }
      .float-card.c1 { left: 0; top: 0; }
      .float-card.c2 { right: -5px; top: 130px; }
      .float-card.c3 { display: none; }
      .fc-title { font-size: 14px; }
      .fc-text { font-size: 12px; }
      .hero-email { flex-direction: column; }
      .hero-input { padding: 14px 16px; font-size: 16px; }
      .hero-btn { padding: 14px; justify-content: center; font-size: 15px; }
      .stories-section { padding: 0 20px 48px; }
      .stories-title { font-size: 24px; }
      .stories-grid { grid-template-columns: 1fr; gap: 16px; }
      .story-card { padding: 22px; border-radius: 16px; }
      .story-card:hover { transform: none; box-shadow: none; }
      .story-card-title { font-size: 18px; }
      .story-card-text { font-size: 14px; }
      .story-card-reactions { gap: 6px; flex-wrap: wrap; }
      .story-reaction { min-width: 40px; height: 40px; font-size: 16px; border-radius: 10px; padding: 0 8px; }
      .reaction-count { font-size: 11px; }
      .submit-section { padding: 0 20px 48px; }
      .submit-inner { grid-template-columns: 1fr; padding: 24px; gap: 20px; border-radius: 20px; }
      .submit-title { font-size: 22px; }
      .submit-textarea { min-height: 120px; font-size: 16px; }
      .submit-row { justify-content: center; }
      .submit-btn { width: 100%; justify-content: center; }
      .sp-card { padding: 20px; }
      .sp-card-title { font-size: 16px; }
      .sp-edit-textarea { font-size: 16px; }
      .sp-title-input { font-size: 16px; }
      .how-section { padding: 48px 20px; }
      .how-title { font-size: 24px; margin-bottom: 32px; }
      .how-grid { grid-template-columns: 1fr; gap: 14px; }
      .how-card { padding: 28px 24px; border-radius: 20px; }
      .cta-section { padding: 48px 20px; }
      .cta-title { font-size: 28px; }
      .cta-sub { font-size: 15px; }
      .cta-email { flex-direction: column; }
      .cta-input { padding: 14px 16px; font-size: 16px; }
      .cta-btn { padding: 14px; font-size: 15px; }
      .footer { padding: 36px 20px 0; }
      .footer-inner { flex-direction: column; gap: 32px; }
      .footer-links-group { gap: 40px; }
      .legal-page { padding: 32px 20px 48px; }
      .legal-page h1 { font-size: 26px; }
      .library-page { padding: 32px 20px 64px; }
      .library-title { font-size: 28px; }
      .library-sub { font-size: 15px; }
      .library-grid { grid-template-columns: 1fr; gap: 16px; }
      .library-search-input { font-size: 16px; padding: 12px 16px 12px 40px; }
      .library-filters { gap: 6px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; scrollbar-width: none; }
      .library-filters::-webkit-scrollbar { display: none; }
      .library-filter { font-size: 12px; padding: 8px 16px; white-space: nowrap; flex-shrink: 0; }
      .library-section-title { font-size: 24px; }
      .subscribe-page { padding: 48px 20px; }
      .subscribe-page h1 { font-size: 28px; }
      .subscribe-page-sub { font-size: 15px; }
      .subscribe-page-input { font-size: 16px; }
      .subscribe-page-btn { font-size: 16px; }
      .submit-page { padding: 32px 16px; }
      .submit-page h1 { font-size: 26px; }
      .submit-page-card { padding: 28px 20px; border-radius: 0 0 16px 16px; }
      .submit-page-textarea { min-height: 160px; font-size: 16px; }
      .submit-page-btn { font-size: 16px; }
      .report-modal { margin: 16px; padding: 24px; border-radius: 16px; }
      .report-option { padding: 12px 14px; }
      .share-toast { bottom: 24px; font-size: 13px; padding: 12px 20px; }
      .story-menu-dropdown { min-width: 160px; }
      .story-menu-item { padding: 12px 14px; font-size: 14px; }
      .auth-page { padding: 48px 20px; }
      .auth-card { padding: 28px 20px; }
      .auth-input { font-size: 16px; }
      .dash-page { padding: 32px 20px 64px; }
      .dash-header { flex-direction: row; gap: 0; align-items: center; }
      .dash-stats { grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .dash-stat { padding: 16px 8px; }
      .dash-stat-num { font-size: 22px; }
      .dash-stat-label { font-size: 11px; }
      .dash-filters { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
      .dash-filter { white-space: nowrap; flex-shrink: 0; }
      .dash-title { font-size: 28px; }
      .dash-story-meta { gap: 12px; flex-wrap: wrap; font-size: 12px; }
      .report-modal { padding: 24px 20px; }
      .report-option { text-align: left; justify-content: flex-start; }
    }

    @media (max-width: 380px) {
      .hero h1 { font-size: 30px; }
      .hero-cards { height: 280px; }
      .float-card { width: 190px; padding: 14px; }
      .story-reaction { min-width: 36px; height: 36px; font-size: 15px; padding: 0 6px; }
      .cta-title { font-size: 24px; }
      .library-title { font-size: 24px; }
      .subscribe-page h1 { font-size: 24px; }
    }

    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      .footer-bottom { padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
      .share-toast { bottom: calc(24px + env(safe-area-inset-bottom)); }
    }
  `;

  return (
    <div style={{ fontFamily: "var(--font)", background: "white", minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Nav */}
      <div className="nav-wrapper">
        <nav className="nav">
          <div className="nav-logo" onClick={() => setPage("home")}>
            <span className="nav-logo-text">Date&amp;Tell</span>
            <span className="nav-logo-tagline">Love, Anonymous.</span>
          </div>
          <div className="nav-right">
            <span className="nav-link" onClick={() => setPage("library")}>Story library</span>
            {authUser ? (
              <button className="nav-user-btn" onClick={() => setPage("dashboard")}><UserIcon /> My stories</button>
            ) : (
              <button className="nav-signup" onClick={() => setPage("signup")}>Sign up</button>
            )}
            <button className="nav-share" onClick={() => setPage("submit")}>Share your story</button>
            <button className="nav-hamburger" onClick={() => setMobileMenu(!mobileMenu)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenu ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </nav>
        {mobileMenu && (
          <div className="mobile-menu">
            <button className="mobile-menu-item" onClick={() => setPage("library")}>Story library</button>
            {authUser ? (
              <button className="mobile-menu-item" onClick={() => setPage("dashboard")}>My stories</button>
            ) : (
              <button className="mobile-menu-item" onClick={() => setPage("signup")}>Sign up</button>
            )}
            <button className="mobile-menu-item primary" onClick={() => setPage("submit")}>Share your story</button>
          </div>
        )}
      </div>

      {page === "home" && (<>
      <section className="hero">
        <div>
          <div className={`hero-eyebrow ${loaded ? "fade-up d1" : ""}`}>
            <span className="eyebrow-dot" /> New stories drop every Friday
          </div>
          <h1 className={loaded ? "fade-up d1" : ""}>
            Real dating stories,<br /><span className="hero-blue">told anonymously.</span>
          </h1>
          <p className={`hero-sub ${loaded ? "fade-up d2" : ""}`}>
            Bite-sized dating stories, dropping in your inbox every Friday. Because dating is more fun when we're all in on the joke.
          </p>
          <div className={loaded ? "fade-up d3" : ""}>
            {heroSub ? (
              <div className="hero-subbed-success">✓ You're subscribed! New stories hit your inbox every Friday.</div>
            ) : (
              <div className="hero-email">
                <input className="hero-input" placeholder="name@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSubscribe("hero"); }} />
                <button className="hero-btn" onClick={() => handleSubscribe("hero")}>Subscribe <Arrow /></button>
              </div>
            )}
          </div>
        </div>
        <div className={`hero-cards ${loaded ? "fade-up d2" : ""}`}>
          <div className="float-card c1">
            <span className="fc-tag">First Dates</span>
            <div className="fc-title">The Spaghetti Incident</div>
            <div className="fc-text">Ordered spaghetti to seem cultured. Sauce on my forehead, noodle on my chin...</div>
            <div className="fc-reactions"><span>😂 89</span><span>❤️ 45</span></div>
          </div>
          <div className="float-card c2">
            <span className="fc-tag">Meet Cutes</span>
            <div className="fc-title">Dog Park Destiny</div>
            <div className="fc-text">My dog knocked his coffee everywhere. He looked at me and said "worth it."</div>
            <div className="fc-reactions"><span>❤️ 95</span><span>✨ 41</span></div>
          </div>
          <div className="float-card c3">
            <span className="fc-tag">Situationships</span>
            <div className="fc-title">The Label Talk</div>
            <div className="fc-text">"I like what we have." "What do we have?" "This conversation is a great example."</div>
            <div className="fc-reactions"><span>😂 134</span><span>💀 67</span></div>
          </div>
        </div>
      </section>

      <div className="home-sections">
      <div className="submit-section home-submit" id="home-submit">
        <div className="submit-inner">
          <div>
            <h2 className="submit-title">Got a dating story?</h2>
            <p className="submit-sub">Chaotic, wholesome, unhinged, we want it all. Your worst date is someone's best Friday read. Write as much as you want, our <strong>AI anonymizes and polishes every story.</strong> All stories go through an approval process before going live.</p>
          </div>
          <div>
            {!submitResult ? (
              <>
                <div className="submit-form-area">
                  <textarea className="submit-textarea" placeholder="Tell us your funniest, cringiest, or cutest dating moment…"
                    rows={5} value={storyText} onChange={e => setStoryText(e.target.value)} />
                  <span className={`submit-char-count ${storyText.length > 750 ? "over" : storyText.length > 600 ? "warn" : ""}`}>{storyText.length}/750</span>
                </div>
                <div className="submit-row">
                  <button className="submit-btn" onClick={handleSubmitStory} disabled={!storyText.trim() || submitting}>
                    {submitting ? <><span className="spinner" /> Our AI is polishing your story...</> : <>Submit story <Arrow /></>}
                  </button>
                </div>
                <div className="submit-trust">🔒 <strong>100% anonymous.</strong> Names and identifying details are always removed.</div>
              </>
            ) : (
              <>
                {renderSubmissionPreview()}

                {!authUser && submitResult.type === "approved" && (
                  <div className="post-submit-signup" id="post-submit-signup">
                    <div className="post-submit-signup-rainbow" />
                    <div className="post-submit-signup-inner">
                    <div className="post-submit-signup-header">
                      <div className="post-submit-signup-title">Save your story to your account</div>
                      <div className="post-submit-signup-sub">Create a free account to track reactions, shares, and get the best dating stories in your inbox every Friday.</div>
                    </div>
                    {renderAuthError()}
                    <label className="auth-label">Name</label>
                    <input className="auth-input" type="text" placeholder="Your first name"
                      value={authName} onChange={e => setAuthName(e.target.value)} />
                    <label className="auth-label">Email</label>
                    <input className="auth-input" type="email" placeholder="name@email.com"
                      value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && authEmail && authPassword) handleSignup(); }} />
                    <label className="auth-label">Password</label>
                    <input className="auth-input" type="password" placeholder="At least 6 characters"
                      value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && authEmail && authPassword) handleSignup(); }} />
                    <button className="auth-btn" onClick={handleSignup} disabled={authLoading || !authEmail || !authPassword}>
                      {authLoading ? <><span className="spinner" /> Creating account...</> : "Create free account"}
                    </button>
                    <div className="auth-switch">
                      Already have an account? <span className="auth-switch-link" onClick={() => setPage("login")}>Log in</span>
                    </div>
                    </div>
                  </div>
                )}

                <button className="submit-another-btn" onClick={() => { setSubmitResult(null); setStoryText(""); setOriginalStoryText(""); setShowOriginal(false); setShowSignupPrompt(false); setAuthError(""); setTimeout(() => { const el = document.getElementById("home-submit"); if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 100; window.scrollTo({ top: y, behavior: "smooth" }); } }, 50); }}>
                  Submit another story
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="stories-section home-stories">
        <div className="stories-header">
          <div>
            <div className="stories-title">This week's drop</div>
            <div className="rainbow-accent" />
          </div>
          <span className="stories-link" onClick={() => setPage("library")}>Browse all stories <Arrow /></span>
        </div>
        <div className="stories-grid">
          {homeStories.map((s) => (
            <StoryCard key={s.id} story={s} onReaction={handleReaction} onReport={handleReport} onSave={handleSaveStory} reacted={storyReactions} isSaved={savedStories.map(String).includes(String(s.id))} isTrending={s._isTrending} storyText={storyText} onStoryTextChange={setStoryText} onNavigateSubmit={() => setPage("submit")} />
          ))}
        </div>
      </div>
      </div>

      <div className="how-section">
        <div className="how-inner">
          <div className="how-title">How it works</div>
          <div className="how-grid">
            <div className="how-card"><div className="how-num">01</div><h3>Tell your story</h3><p>Submit your anonymous dating story. Chaotic, wholesome, unhinged, we want it all. No names, no judgment.</p></div>
            <div className="how-card"><div className="how-num">02</div><h3>We give it a glow-up</h3><p>Our AI polishes your story while keeping your voice. All identifying details are removed automatically.</p></div>
            <div className="how-card"><div className="how-num">03</div><h3>Friday drop</h3><p>Every Friday, the best stories go live on the site and land in your inbox. Fresh stories, weekly.</p></div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-title">Your inbox deserves better stories.</div>
        <p className="cta-sub">Bite-sized dating stories from real people, dropping every Friday. Love, Anonymous.</p>
        {ctaSub ? (
          <div className="hero-subbed-success" style={{ maxWidth: 480, margin: "0 auto" }}>✓ You've joined the waitlist! You'll be the first to know when our first Friday drop goes live.</div>
        ) : (
          <div className="cta-email">
            <input className="cta-input" placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubscribe("cta"); }} />
            <button className="cta-btn" onClick={() => handleSubscribe("cta")}>Subscribe</button>
          </div>
        )}
      </div>
      </>)}

      {/* Library */}
      {page === "library" && (
        <div className="library-page">
          <div className="library-header">
            <h1 className="library-title">Story library</h1>
            <p className="library-sub">Every tale from the dating trenches, all in one place.</p>
          </div>
          <div className="library-search">
            <div className="library-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input className="library-search-input" placeholder="Search stories, themes, personas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && <button className="library-search-clear" onClick={() => setSearchQuery("")}>✕</button>}
          </div>
          <div className="library-filters">
            {allThemes.map(t => (
              <button key={t} className={`library-filter ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
          {!searchQuery && filteredThisWeek.length > 0 && (
            <>
              <div className="library-section-title">This week's drop</div>
              <div className="rainbow-accent" style={{ marginBottom: 20 }} />
              <div className="library-grid">
                {filteredThisWeek.map(s => <StoryCard key={s.id} story={s} onReaction={handleReaction} onReport={handleReport} onSave={handleSaveStory} reacted={storyReactions} isSaved={savedStories.map(String).includes(String(s.id))} isTrending={s._isTrending} storyText={storyText} onStoryTextChange={setStoryText} onNavigateSubmit={() => setPage("submit")} />)}
              </div>
              <div className="library-divider" />
            </>
          )}
          <div className="library-section-title">{searchQuery ? `Results for "${searchQuery}"` : "All stories"}</div>
          <div className="rainbow-accent" style={{ marginBottom: 20 }} />
          {filteredAll.length > 0 ? (
            <div className="library-grid">
              {filteredAll.map(s => <StoryCard key={s.id} story={s} onReaction={handleReaction} onReport={handleReport} onSave={handleSaveStory} reacted={storyReactions} isSaved={savedStories.map(String).includes(String(s.id))} isTrending={s._isTrending} storyText={storyText} onStoryTextChange={setStoryText} onNavigateSubmit={() => setPage("submit")} />)}
            </div>
          ) : (
            <div className="library-grid"><div className="library-empty">{searchQuery ? "No stories match your search." : "No stories found for this filter."}</div></div>
          )}
        </div>
      )}

      {/* Subscribe Page */}
      {page === "subscribe" && (
        <div className="subscribe-page">
          <div className="subscribe-heart">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#2563EB" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h1>Get stories every <em>Friday</em></h1>
          <p className="subscribe-page-sub">The funniest, cringiest, and cutest anonymous dating stories, curated and delivered to your inbox weekly.</p>
          {pageSub ? (
            <div className="hero-subbed-success" style={{ marginBottom: 16 }}>✓ You've joined the waitlist! You'll be the first to know when our first Friday drop goes live.</div>
          ) : (<>
            <input className="subscribe-page-input" placeholder="name@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubscribe("page"); }} />
            <button className="subscribe-page-btn" onClick={() => handleSubscribe("page")}>Subscribe (it's free)</button>
          </>)}
          <p className="subscribe-page-fine">No spam, ever. Unsubscribe anytime.</p>
        </div>
      )}

      {/* Submit Page */}
      {page === "submit" && (
        <div className="submit-page">
          <div className="submit-page-rainbow" />
          <div className="submit-page-card">
            <h1>Spill it. Anonymously.</h1>
            <p className="submit-page-sub">Write as much as you want — our <strong>AI removes names and identifying details</strong> so no one ever knows it's you.</p>

            {/* Show form if no result yet, otherwise show post-submit flow */}
            {!submitResult ? (
              <>
                <div className="submit-page-form">
                  <textarea className="submit-page-textarea" placeholder="Tell us your funniest, cringiest, or cutest dating moment…"
                    value={storyText} onChange={e => setStoryText(e.target.value)} />
                  <span className={`submit-page-char ${storyText.length > 750 ? "over" : storyText.length > 600 ? "warn" : ""}`}>{storyText.length}/750</span>
                </div>
                <button className="submit-page-btn" onClick={handleSubmitStory} disabled={!storyText.trim() || submitting}>
                  {submitting ? <><span className="spinner" /> Our AI is polishing your story...</> : "Submit story"}
                </button>
                <p className="submit-page-fine">🔒 <strong>100% anonymous.</strong> Names and identifying details are always removed.</p>
              </>
            ) : (
              <>
                {renderSubmissionPreview()}

                {/* Inline signup after submission (only if not logged in) */}
                {!authUser && submitResult.type === "approved" && (
                  <div className="post-submit-signup" id="post-submit-signup">
                    <div className="post-submit-signup-rainbow" />
                    <div className="post-submit-signup-inner">
                    <div className="post-submit-signup-header">
                      <div className="post-submit-signup-title">Save your story to your account</div>
                      <div className="post-submit-signup-sub">Create a free account to track reactions, shares, and get the best dating stories in your inbox every Friday.</div>
                    </div>

                    {renderAuthError()}

                    <label className="auth-label">Name</label>
                    <input className="auth-input" type="text" placeholder="Your first name"
                      value={authName} onChange={e => setAuthName(e.target.value)} />

                    <label className="auth-label">Email</label>
                    <input className="auth-input" type="email" placeholder="name@email.com"
                      value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && authEmail && authPassword) handleSignup(); }} />

                    <label className="auth-label">Password</label>
                    <input className="auth-input" type="password" placeholder="At least 6 characters"
                      value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && authEmail && authPassword) handleSignup(); }} />

                    <button className="auth-btn" onClick={handleSignup} disabled={authLoading || !authEmail || !authPassword}>
                      {authLoading ? <><span className="spinner" /> Creating account...</> : "Create free account"}
                    </button>

                    <div className="auth-switch">
                      Already have an account? <span className="auth-switch-link" onClick={() => setPage("login")}>Log in</span>
                    </div>
                    </div>
                  </div>
                )}

                {/* Submit another story — at the bottom */}
                <button className="submit-another-btn" onClick={() => { setSubmitResult(null); setStoryText(""); setOriginalStoryText(""); setShowOriginal(false); setShowSignupPrompt(false); setAuthError(""); window.scrollTo(0, 0); }}>
                  Submit another story
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Login Page */}
      {page === "login" && (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-title">Welcome back</div>
            <div className="auth-subtitle">Log in to track your stories and see how people react.</div>

            {renderAuthError()}

            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" placeholder="name@email.com"
              value={authEmail} onChange={e => setAuthEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />

            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="Your password"
              value={authPassword} onChange={e => setAuthPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />

            <div className="auth-forgot" onClick={() => { setAuthError(""); setPage("forgot-password"); }}>Forgot password?</div>

            <button className="auth-btn" onClick={handleLogin} disabled={authLoading || !authEmail || !authPassword}>
              {authLoading ? <><span className="spinner" /> Logging in...</> : "Log in"}
            </button>

            <div className="auth-switch">
              Don't have an account? <span className="auth-switch-link" onClick={() => setPage("signup")}>Sign up</span> to save your stories and track reactions.
            </div>
          </div>
        </div>
      )}

      {/* Signup Page */}
      {page === "signup" && (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-title">Create your account</div>
            <div className="auth-subtitle">{signupReason === "save" ? "Sign up to save stories to your profile and never lose your favorites." : "Track your stories, see reactions, and get the best dating stories in your inbox every Friday."}</div>

            {renderAuthError()}

            <label className="auth-label">Name</label>
            <input className="auth-input" type="text" placeholder="Your first name"
              value={authName} onChange={e => setAuthName(e.target.value)} />

            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" placeholder="name@email.com"
              value={authEmail} onChange={e => setAuthEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSignup(); }} />

            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="At least 6 characters"
              value={authPassword} onChange={e => setAuthPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSignup(); }} />

            <button className="auth-btn" onClick={handleSignup} disabled={authLoading || !authEmail || !authPassword}>
              {authLoading ? <><span className="spinner" /> Creating account...</> : "Create free account"}
            </button>

            <div className="auth-switch">
              Already have an account? <span className="auth-switch-link" onClick={() => setPage("login")}>Log in</span>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Page */}
      {page === "forgot-password" && (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-title">Reset your password</div>
            <div className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</div>

            {resetSent ? (
              <div className="auth-success">
                <div className="auth-success-icon">✉️</div>
                <div className="auth-success-title">Check your email</div>
                <div className="auth-success-sub">We sent a reset link to <strong>{authEmail}</strong>. Click the link in the email to set a new password.</div>
                <button className="auth-btn-secondary" onClick={() => { setResetSent(false); setPage("login"); }}>Back to login</button>
              </div>
            ) : (
              <>
                {renderAuthError()}

                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" placeholder="name@email.com"
                  value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleResetRequest(); }} />

                <button className="auth-btn" onClick={handleResetRequest} disabled={authLoading || !authEmail}>
                  {authLoading ? <><span className="spinner" /> Sending...</> : "Send reset link"}
                </button>

                <div className="auth-switch">
                  Remember your password? <span className="auth-switch-link" onClick={() => setPage("login")}>Log in</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Page (from email link) */}
      {page === "reset-password" && (
        <div className="auth-page">
          <div className="auth-card">
            {resetSuccess ? (
              <div className="auth-success">
                <div className="auth-success-icon">✅</div>
                <div className="auth-success-title">Password updated</div>
                <div className="auth-success-sub">Your password has been reset. You can now log in with your new password.</div>
                <button className="auth-btn" onClick={() => { setResetSuccess(false); setResetToken(null); setPage("login"); }}>Log in</button>
              </div>
            ) : resetToken ? (
              <>
                <div className="auth-title">Set a new password</div>
                <div className="auth-subtitle">Choose a new password for your account.</div>

                {renderAuthError()}

                <label className="auth-label">New password</label>
                <input className="auth-input" type="password" placeholder="At least 6 characters"
                  value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleResetPassword(); }} />

                <button className="auth-btn" onClick={handleResetPassword} disabled={authLoading || !authPassword}>
                  {authLoading ? <><span className="spinner" /> Updating...</> : "Update password"}
                </button>
              </>
            ) : (
              <div className="auth-success">
                <div className="auth-success-icon">⚠️</div>
                <div className="auth-success-title">Invalid or expired link</div>
                <div className="auth-success-sub">This password reset link is no longer valid. Please request a new one.</div>
                <button className="auth-btn" onClick={() => setPage("forgot-password")}>Request new link</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dashboard */}
      {page === "dashboard" && (
        authUser ? (
          <div className="dash-page">
            {/* Welcome popup */}
            {showDashWelcome && (
              <div className="dash-welcome-overlay" onClick={() => setShowDashWelcome(false)}>
                <div className="dash-welcome" onClick={e => e.stopPropagation()}>
                  <div className="dash-welcome-emoji">🎉</div>
                  <div className="dash-welcome-title">You're in! Consider this your story HQ.</div>
                  <div className="dash-welcome-text">This is your personal dashboard. Here you can track every story you submit, see how people react to your published stories, and share your favorites.</div>
                  <button className="auth-btn" onClick={() => setShowDashWelcome(false)}>View my stories</button>
                </div>
              </div>
            )}
            <div className="dash-header">
              <div>
                <h1 className="dash-title">My stories</h1>
                <div className="dash-email">{authUser.user.email}</div>
              </div>
              <button className="dash-logout" onClick={handleLogout}>Log out</button>
            </div>

            <div className="dash-stats">
              <div className="dash-stat">
                <div className="dash-stat-num">{dashboardStories.length}</div>
                <div className="dash-stat-label">Stories submitted</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-num">{dashboardStories.filter(s => s.status === "published").length}</div>
                <div className="dash-stat-label">Published</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-num">{dashboardStories.reduce((sum, s) => sum + getTotalReactions(s.reactions), 0)}</div>
                <div className="dash-stat-label">Total reactions</div>
              </div>
            </div>

            <div className="dash-section-title">Your stories</div>
            <div className="rainbow-accent" style={{ marginBottom: 12 }} />

            <div className="dash-filters">
              {["all", "published", "pending", "saved"].map(f => (
                <button key={f} className={`dash-filter ${dashFilter === f ? "active" : ""}`} onClick={() => setDashFilter(f)}>
                  {f === "all" ? "All" : f === "saved" ? <><StarIcon filled={false} /> Saved</> : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="dash-filter-count">{f === "all" ? dashboardStories.length : f === "saved" ? savedStories.length : dashboardStories.filter(s => s.status === f).length}</span>
                </button>
              ))}
            </div>

            {dashboardLoading ? (
              <div className="dash-loading"><span className="spinner" style={{ borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--blue)", width: 24, height: 24 }} /></div>
            ) : dashFilter === "saved" ? (
              (() => {
                const savedList = stories.filter(s => savedStories.map(String).includes(String(s.id)));
                return savedList.length === 0 ? (
                  <div className="dash-empty" style={{ padding: "40px 20px" }}>
                    <div className="dash-empty-icon"><StarIcon filled={false} /></div>
                    <div className="dash-empty-title">No saved stories yet</div>
                    <div className="dash-empty-sub">Browse the <span className="auth-switch-link" onClick={() => setPage("library")}>Story library</span> and save your favorites.</div>
                  </div>
                ) : savedList.map(s => (
                  <div key={s.id} className="dash-story">
                    <div className="dash-story-top">
                      <div className="dash-story-title">{s.title}</div>
                      <span className="dash-story-status" style={{ background: "#FFFBEB", color: "#D97706" }}><StarIcon filled /> saved</span>
                    </div>
                    <div className="dash-story-text">{s.text}</div>
                    <div className="dash-story-meta">
                      <span>🏷️ {s.theme}</span>
                      <span>— {s.author}</span>
                      <span className="dash-share-link" onClick={() => handleSaveStory(s.id)} style={{ color: "#DC2626" }}>
                        Remove
                      </span>
                    </div>
                  </div>
                ));
              })()
            ) : dashboardStories.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">✍️</div>
                <div className="dash-empty-title">No stories yet</div>
                <div className="dash-empty-sub">Share your first dating story and track how people react to it.</div>
                <button className="dash-empty-btn" onClick={() => setPage("submit")}>Share a story</button>
              </div>
            ) : (
              (() => {
                const filtered = dashFilter === "all" ? dashboardStories : dashboardStories.filter(s => s.status === dashFilter);
                return filtered.length === 0 ? (
                  <div className="dash-empty" style={{ padding: "40px 20px" }}>
                    <div className="dash-empty-title">No {dashFilter} stories</div>
                    <div className="dash-empty-sub">Stories will appear here once they're {dashFilter}.</div>
                  </div>
                ) : filtered.map(s => {
                const statusStyle = getStatusColor(s.status);
                const totalReactions = getTotalReactions(s.reactions);
                const isPublished = s.status === "published";
                return (
                  <div key={s.id} className="dash-story">
                    <div className="dash-story-top">
                      <div className="dash-story-title">{s.title || "Untitled"}</div>
                      <span className="dash-story-status" style={{ background: statusStyle.bg, color: statusStyle.color }}>{s.status}</span>
                    </div>
                    <div className="dash-story-text">{s.rewritten_text}</div>

                    {isPublished && (
                      <div className="dash-story-reactions">
                        {EMOJI_OPTIONS.map(emoji => {
                          const count = s.reactions?.[emoji] || 0;
                          return (
                            <span key={emoji} className="dash-reaction-pill">
                              {emoji} <span className="dash-reaction-count">{count}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="dash-story-meta">
                      {!isPublished && <span>📊 {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}</span>}
                      <span>🏷️ {s.theme}</span>
                      <span>📅 {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "—"}</span>
                      {isPublished && (
                        <span className="dash-share-link" onClick={async (e) => {
                          const shareUrl = "https://dateandtell.com";
                          const el = e.currentTarget;
                          const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
                          try {
                            if (isMobile && navigator.share) {
                              await navigator.share({ title: s.title, text: "Check out this story on Date&Tell!", url: shareUrl });
                              return;
                            }
                            if (navigator.clipboard) {
                              await navigator.clipboard.writeText(`"${s.title}" — ${s.rewritten_text}\n\n— ${s.author_persona} on Date & Tell\n${shareUrl}`);
                              const origText = el.textContent;
                              el.textContent = "Copied!";
                              setTimeout(() => { el.textContent = origText; }, 1500);
                            }
                          } catch {}
                        }}>
                          <ShareIcon /> Share
                        </span>
                      )}
                    </div>
                    {s.status === "pending" && (
                      <div className="dash-delete-row">
                        {confirmDeleteId === s.id ? (
                          <div className="dash-delete-confirm">
                            <span className="dash-delete-confirm-text">Delete this story?</span>
                            <button className="dash-delete-yes" onClick={() => handleDeleteDashStory(s.id)} disabled={deletingStoryId === s.id}>
                              {deletingStoryId === s.id ? "Deleting..." : "Yes, delete"}
                            </button>
                            <button className="dash-delete-no" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button className="dash-delete-btn" onClick={() => setConfirmDeleteId(s.id)}>🗑️ Delete story</button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
              })()
            )}
          </div>
        ) : (
          <div className="auth-page">
            <div className="auth-card" style={{ textAlign: "center" }}>
              <div className="auth-title">Log in to see your stories</div>
              <div className="auth-subtitle">Create an account or log in to track your stories and reactions.</div>
              <button className="auth-btn" onClick={() => setPage("login")}>Log in</button>
              <div className="auth-switch">
                Don't have an account? <span className="auth-switch-link" onClick={() => setPage("signup")}>Sign up</span>
              </div>
            </div>
          </div>
        )
      )}

      {/* Terms of Service */}
      {page === "terms" && (
        <div className="legal-page">
          <h1>Terms of Service</h1>
          <p className="legal-date">Effective Date: February 17, 2026</p>

          <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Date&Tell ("Company," "we," "us," or "our"), governing your access to and use of the website located at dateandtell.com, including all associated services, features, content, and applications (collectively, the "Service"). By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Service.</p>

          <h2>1. Eligibility</h2>
          <p>1.1. You must be at least eighteen (18) years of age to access or use the Service. By using the Service, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.</p>
          <p>1.2. If you are accessing the Service on behalf of an entity, you represent and warrant that you have the authority to bind that entity to these Terms.</p>

          <h2>2. Account Registration</h2>
          <p>2.1. To access certain features of the Service, you may be required to create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.</p>
          <p>2.2. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at hello@dateandtell.com of any unauthorized use of your account.</p>
          <p>2.3. We reserve the right to suspend, disable, or terminate your account at our sole discretion, with or without notice, for any reason, including but not limited to a breach of these Terms.</p>

          <h2>3. User-Submitted Content</h2>
          <p>3.1. <strong>License Grant.</strong> By submitting any content to the Service, including but not limited to dating stories, text, or other materials ("User Content"), you hereby grant the Company a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, transferable, and sublicensable license to use, reproduce, modify, adapt, edit, publish, translate, create derivative works from, distribute, display, and perform such User Content in any and all media or distribution methods now known or later developed, including but not limited to the Service, newsletters, social media, marketing materials, and any other channels.</p>
          <p>3.2. <strong>AI Editing.</strong> You acknowledge and agree that all User Content submitted to the Service will be processed by artificial intelligence technology for purposes including, but not limited to: content moderation, editing for tone and length, removal of personally identifying information, generation of titles, assignment of anonymous persona names, and generation of searchable tags. The resulting edited content ("Published Content") may differ materially from your original submission. You consent to such modifications.</p>
          <p>3.3. <strong>Representations and Warranties.</strong> By submitting User Content, you represent and warrant that: (a) the User Content is based on your own personal experience; (b) you own or have all necessary rights, licenses, and permissions to submit the User Content and to grant the license set forth in Section 3.1; (c) the User Content does not infringe, misappropriate, or violate any third party's intellectual property rights, privacy rights, publicity rights, or any other legal rights; (d) the User Content does not contain the full legal name of any identifiable third party without their express consent; and (e) the User Content does not violate any applicable law, regulation, or these Terms.</p>
          <p>3.4. <strong>Prohibited Content.</strong> You agree not to submit User Content that: (a) is sexually explicit or pornographic; (b) contains hate speech, threats, harassment, or intimidation directed at any individual or group; (c) is defamatory, libelous, or knowingly false; (d) promotes or describes illegal activity; (e) contains content involving minors in any romantic or sexual context; (f) contains personal identifying information of third parties, including full names, addresses, phone numbers, or employment details; or (g) violates any applicable local, state, national, or international law.</p>
          <p>3.5. <strong>Content Removal.</strong> We reserve the right, but assume no obligation, to monitor, review, edit, or remove any User Content or Published Content at our sole discretion, for any reason, without notice. We are under no obligation to publish any User Content.</p>

          <h2>4. Intellectual Property</h2>
          <p>4.1. <strong>Company IP.</strong> The Service, including its design, layout, look and feel, graphics, logos, trademarks, service marks, trade names ("Date&Tell," "Love, Anonymous"), and all software, code, and technology underlying the Service (collectively, "Company IP") are owned by or licensed to the Company and are protected by United States and international intellectual property laws. You may not use, copy, reproduce, modify, or distribute any Company IP without our prior written consent.</p>
          <p>4.2. <strong>Published Content.</strong> All Published Content, including AI-generated edits, titles, persona names, theme classifications, and tags, constitutes a derivative work and is the property of the Company. Your original, unedited User Content remains your property, subject to the license granted in Section 3.1.</p>
          <p>4.3. <strong>Feedback.</strong> Any feedback, suggestions, ideas, or other information you provide regarding the Service ("Feedback") is non-confidential and shall become the sole property of the Company. The Company shall be free to use Feedback for any purpose without compensation or attribution to you.</p>

          <h2>5. Newsletter and Communications</h2>
          <p>5.1. By creating an account or subscribing to the Company's newsletter, you consent to receive electronic communications from us, including but not limited to: welcome emails, weekly newsletter emails, transactional emails (password resets, story status notifications), and promotional communications.</p>
          <p>5.2. You may opt out of newsletter communications at any time by using the unsubscribe link included in each email. Transactional emails related to your account (such as password resets) cannot be opted out of while your account remains active.</p>

          <h2>6. Acceptable Use</h2>
          <p>6.1. You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to: (a) use the Service to harass, abuse, stalk, threaten, or otherwise violate the legal rights of others; (b) submit false or malicious reports against stories or users; (c) attempt to gain unauthorized access to any part of the Service, other users' accounts, or any systems or networks connected to the Service; (d) use any automated means, including bots, scrapers, crawlers, or spiders, to access or interact with the Service without our express written permission; (e) reverse-engineer, decompile, disassemble, or otherwise attempt to derive the source code of any part of the Service; (f) interfere with or disrupt the integrity or performance of the Service; (g) use the Service to transmit any viruses, malware, or other harmful code; or (h) use shared stories to attempt to identify, dox, or harass the original author.</p>

          <h2>7. Reporting and Moderation</h2>
          <p>7.1. Users may report Published Content they believe violates these Terms by using the reporting feature available on the Service. We will review reports in good faith but are under no obligation to take any specific action.</p>
          <p>7.2. We may, at our sole discretion, remove content, issue warnings, or suspend or terminate accounts of users who violate these Terms or whose content is the subject of repeated reports.</p>

          <h2>8. Disclaimers</h2>
          <p>8.1. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
          <p>8.2. WE DO NOT WARRANT THAT: (A) THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE; (B) THE RESULTS OBTAINED FROM THE SERVICE WILL BE ACCURATE OR RELIABLE; (C) ANY CONTENT, INCLUDING USER CONTENT AND PUBLISHED CONTENT, IS TRUTHFUL, ACCURATE, OR COMPLETE; OR (D) ANY DEFECTS IN THE SERVICE WILL BE CORRECTED.</p>
          <p>8.3. ALL USER CONTENT AND PUBLISHED CONTENT ON THE SERVICE IS USER-GENERATED AND AI-EDITED. WE MAKE NO REPRESENTATIONS OR WARRANTIES REGARDING THE TRUTHFULNESS, ACCURACY, OR RELIABILITY OF ANY STORY PUBLISHED ON THE SERVICE. YOU ACKNOWLEDGE THAT STORIES ARE ANONYMOUS, UNVERIFIED, AND MAY HAVE BEEN MATERIALLY ALTERED BY AI PROCESSING.</p>

          <h2>9. Limitation of Liability</h2>
          <p>9.1. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS OFFICERS, DIRECTORS, MEMBERS, EMPLOYEES, AGENTS, AFFILIATES, SUCCESSORS, OR ASSIGNS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH: (A) YOUR ACCESS TO OR USE OF, OR INABILITY TO ACCESS OR USE, THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (C) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS OR ANY PERSONAL INFORMATION STORED THEREIN; OR (D) ANY INTERRUPTION OR CESSATION OF THE SERVICE.</p>
          <p>9.2. IN NO EVENT SHALL THE COMPANY'S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE OR THESE TERMS EXCEED THE GREATER OF: (A) THE AMOUNTS YOU HAVE PAID TO THE COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00).</p>

          <h2>10. Indemnification</h2>
          <p>10.1. You agree to defend, indemnify, and hold harmless the Company, its officers, directors, members, employees, agents, affiliates, successors, and assigns from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including but not limited to reasonable attorneys' fees) arising from: (a) your use of the Service; (b) your User Content; (c) your violation of these Terms; or (d) your violation of any rights of a third party.</p>

          <h2>11. Dispute Resolution</h2>
          <p>11.1. <strong>Governing Law.</strong> These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.</p>
          <p>11.2. <strong>Informal Resolution.</strong> Before filing any formal legal action, you agree to first contact us at hello@dateandtell.com and attempt to resolve the dispute informally for at least thirty (30) days.</p>
          <p>11.3. <strong>Arbitration.</strong> Any dispute arising out of or relating to these Terms or the Service that cannot be resolved informally shall be finally resolved by binding arbitration administered in accordance with the rules of the American Arbitration Association. The arbitration shall be conducted in San Francisco, California.</p>
          <p>11.4. <strong>Class Action Waiver.</strong> YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.</p>

          <h2>12. Modifications</h2>
          <p>12.1. We reserve the right to modify, suspend, or discontinue the Service at any time, with or without notice, and without liability to you.</p>
          <p>12.2. We may revise these Terms from time to time. If we make material changes, we will notify you by email or by posting a notice on the Service. Your continued use of the Service after changes constitutes acceptance of the revised Terms.</p>

          <h2>13. General Provisions</h2>
          <p>13.1. These Terms, together with the Privacy Policy, constitute the entire agreement between you and the Company regarding the Service.</p>
          <p>13.2. If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
          <p>13.3. The failure of the Company to enforce any right or provision shall not constitute a waiver of such right or provision.</p>
          <p>13.4. You may not assign these Terms without our prior written consent. We may assign these Terms without restriction.</p>

          <h2>14. Contact</h2>
          <p>Date&Tell<br />Email: <a href="mailto:hello@dateandtell.com">hello@dateandtell.com</a></p>
        </div>
      )}

      {/* Privacy Policy */}
      {page === "privacy" && (
        <div className="legal-page">
          <h1>Privacy Policy</h1>
          <p className="legal-date">Effective Date: February 17, 2026</p>

          <p>This Privacy Policy ("Policy") describes how Date&Tell ("Company," "we," "us," or "our") collects, uses, discloses, and protects information obtained from users ("User," "you," or "your") of the website located at dateandtell.com, including all associated services, features, and applications (collectively, the "Service"). By accessing or using the Service, you consent to the data practices described in this Policy.</p>

          <h2>1. Information We Collect</h2>
          <h3>1.1. Information You Provide Directly</h3>
          <p><strong>(a) Account Information.</strong> When you create an account, we collect your first name, email address, and password. Passwords are cryptographically hashed by our authentication provider and are never stored in plain text.</p>
          <p><strong>(b) User Content.</strong> When you submit a story, we collect the full text of your submission. If you are logged in, your submission is associated with your account.</p>
          <p><strong>(c) Communications.</strong> If you contact us directly, we may collect your name, email address, and the contents of your message.</p>

          <h3>1.2. Information Collected Automatically</h3>
          <p><strong>(a) Geolocation Data.</strong> When you submit a story, our hosting provider (Vercel) provides us with your approximate city and country based on your IP address. This data is used for internal analytics only and is never published or shared.</p>
          <p><strong>(b) Device and Usage Information.</strong> We automatically collect certain information including your IP address, browser type, operating system, pages visited, and time of access through standard server logs.</p>
          <p><strong>(c) Email Engagement Data.</strong> Our email service providers may collect data regarding email opens and link clicks to improve our communications.</p>

          <h3>1.3. Information Stored Locally</h3>
          <p>We use your browser's local storage to save preferences such as emoji reactions and saved stories. This data stays on your device and is not sent to our servers.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use collected information to: (a) provide and operate the Service; (b) process User Content through AI moderation and editing; (c) manage your account; (d) send transactional emails; (e) send newsletter emails if you opted in; (f) analyze usage patterns to improve the Service; (g) detect and prevent fraud or unauthorized activity; (h) enforce our Terms of Service; (i) respond to inquiries; and (j) comply with legal obligations.</p>
          <p><strong>We will never sell your personal information to third parties.</strong></p>

          <h2>3. AI Processing</h2>
          <p>3.1. User Content is transmitted to Anthropic, Inc. for automated AI processing including moderation, editing, anonymization, and title generation. Published Content may differ materially from your original submission.</p>
          <p>3.2. Your original submission is stored in our database but is never displayed publicly. Only the edited, anonymized version is published.</p>

          <h2>4. Third-Party Service Providers</h2>
          <p>We use the following services to operate Date&Tell: <strong>Supabase</strong> (database and authentication), <strong>Vercel</strong> (hosting), <strong>Anthropic</strong> (AI processing), <strong>Resend</strong> (transactional email), and <strong>Beehiiv</strong> (newsletter). Each processes data only as necessary to provide their services.</p>
          <p>We may also disclose information if required by law, regulation, or legal process, or in connection with a merger, acquisition, or sale of assets.</p>

          <h2>5. Data Retention</h2>
          <p>5.1. We retain your data for as long as your account is active. Upon deletion request, personal information is deleted within thirty (30) days.</p>
          <p>5.2. Published Content may be retained in anonymized form after account deletion unless you specifically request removal.</p>

          <h2>6. Data Security</h2>
          <p>We implement commercially reasonable measures to protect your data, including encryption in transit (TLS/HTTPS), hashed passwords, and secure API key management. No method of transmission is completely secure, and we cannot guarantee absolute security.</p>

          <h2>7. Your Rights</h2>
          <p>All users may: access their data via their account, request corrections, request account deletion at hello@dateandtell.com, opt out of newsletters via unsubscribe links, and request removal of published stories.</p>
          <p><strong>EEA Residents:</strong> You have additional rights under the GDPR including access, rectification, erasure, restriction of processing, data portability, objection to processing, and the right to lodge a complaint with a supervisory authority.</p>
          <p><strong>California Residents:</strong> You have rights under the CCPA/CPRA including the right to know, delete, opt out of sale (note: we do not sell personal information), non-discrimination, and correction. We respond to verifiable requests within forty-five (45) days.</p>

          <h2>8. Cookies</h2>
          <p>We do not use tracking cookies. We use browser local storage for user preferences. Our third-party providers may use their own cookies in connection with their services.</p>

          <h2>9. Children's Privacy</h2>
          <p>The Service is not directed to individuals under eighteen (18). We do not knowingly collect information from minors. If we learn we have collected such information, we will delete it promptly.</p>

          <h2>10. International Transfers</h2>
          <p>The Service is operated from the United States. By using the Service, you consent to the transfer and processing of your information in the United States.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this Policy from time to time. Material changes will be communicated via email or a notice on the Service at least thirty (30) days before taking effect. Continued use constitutes acceptance.</p>

          <h2>12. Contact</h2>
          <p>Date&Tell<br />Email: <a href="mailto:hello@dateandtell.com">hello@dateandtell.com</a></p>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo" onClick={() => setPage("home")} style={{ cursor: "pointer" }}>Date&Tell</div>
            <div className="footer-tagline">Anonymous dating stories, delivered every Friday. Because dating is more fun when we're all in on the joke.</div>
          </div>
          <div className="footer-links-group">
            <div className="footer-col">
              <div className="footer-col-title">Quick Links</div>
              <span className="footer-link" onClick={() => setPage("submit")}>Share a story</span>
              <span className="footer-link" onClick={() => setPage("library")}>Story library</span>
              <span className="footer-link" onClick={() => setPage("subscribe")}>Subscribe</span>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Support</div>
              <span className="footer-link" onClick={() => setPage("privacy")}>Privacy policy</span>
              <span className="footer-link" onClick={() => setPage("terms")}>Terms of service</span>
              <a href="mailto:hello@dateandtell.com" className="footer-link">Contact us</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Date&Tell. All rights reserved. Love, Anonymous.</div>
        </div>
      </footer>
    </div>
  );
}
