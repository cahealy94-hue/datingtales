"use client";
import { useState, useEffect } from "react";

const THEMES = ["First Dates", "Meet Cutes", "Dating App Disasters", "Awkward Moments", "Meeting the Family", "Situationships"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stories, setStories] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editPersona, setEditPersona] = useState("");
  const [editTheme, setEditTheme] = useState("");

  const login = async () => {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      localStorage.setItem("admin_pass", password);
    } else {
      alert("Wrong password");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin_pass");
    if (saved) {
      setPassword(saved);
      fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: saved }),
      }).then(res => { if (res.ok) setAuthed(true); });
    }
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/stories?status=${filter}`, {
      headers: { "x-admin-password": password },
    });
    if (res.ok) setStories(await res.json());
    setLoading(false);
  };

  useEffect(() => { if (authed) fetchStories(); }, [authed, filter]);

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/stories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStories(prev => prev.filter(s => s.id !== id));
      } else {
        alert(`Failed to update story: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    setActionLoading(null);
  };

  const startEdit = (story) => {
    setEditing(story.id);
    setEditTitle(story.title || "");
    setEditText(story.rewritten_text || "");
    setEditPersona(story.author_persona || "");
    setEditTheme(story.theme || "");
  };

  const saveEdit = async (id) => {
    setActionLoading(id);
    await fetch("/api/admin/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id, title: editTitle, rewritten_text: editText, author_persona: editPersona, theme: editTheme }),
    });
    setStories(prev => prev.map(s => s.id === id ? { ...s, title: editTitle, rewritten_text: editText, author_persona: editPersona, theme: editTheme } : s));
    setEditing(null);
    setActionLoading(null);
  };

  const tabs = [
    { key: "pending", label: "Pending", desc: "New submissions awaiting review" },
    { key: "approved", label: "Approved", desc: "Approved stories ready to be queued" },
    { key: "queued", label: "Queued", desc: "Stories scheduled for next Friday's drop (6 max)" },
    { key: "published", label: "Published", desc: "Live stories on the site" },
    { key: "reported", label: "Reported", desc: "Stories flagged by readers" },
    { key: "deleted", label: "Deleted", desc: "Removed stories" },
    { key: "rejected", label: "Rejected", desc: "Rejected submissions" },
  ];

  const currentTab = tabs.find(t => t.key === filter) || tabs[0];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=League+Spartan:wght@700;800;900&display=swap');

    :root {
      --blue: #2563EB; --blue-light: #DBEAFE; --blue-pale: #EFF6FF;
      --blue-dark: #1E40AF; --black: #0F172A; --gray: #64748B;
      --gray-light: #94A3B8; --border: #E2E8F0; --bg: #F8FAFC;
      --font: 'DM Sans', system-ui, sans-serif;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--font); background: var(--bg); color: var(--black); }

    .admin-wrap { max-width: 960px; margin: 0 auto; padding: 40px 24px; }
    .admin-header { margin-bottom: 32px; }
    .admin-header h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 4px; display: flex; align-items: center; gap: 10px; }
    .admin-header h1 svg { color: var(--blue); }
    .admin-header p { color: var(--gray); font-size: 14px; }

    .login-card {
      max-width: 400px; margin: 120px auto; background: white; padding: 40px;
      border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid var(--border);
      text-align: center;
    }
    .login-card h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .login-card p { color: var(--gray); font-size: 14px; margin-bottom: 24px; }
    .login-input {
      width: 100%; padding: 14px 18px; border: 2px solid var(--border); border-radius: 12px;
      font-size: 15px; font-family: var(--font); margin-bottom: 14px; background: var(--bg);
    }
    .login-input:focus { outline: none; border-color: var(--blue); }
    .login-btn {
      width: 100%; padding: 14px; background: var(--blue); color: white; border: none;
      border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: var(--font);
    }
    .login-btn:hover { background: var(--blue-dark); }

    .tabs { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
    .tab {
      padding: 8px 18px; border-radius: 100px; font-size: 13px; font-weight: 600;
      border: 1.5px solid var(--border); background: white; cursor: pointer;
      font-family: var(--font); color: var(--gray); transition: all 0.2s;
    }
    .tab:hover { border-color: var(--blue-light); color: var(--black); }
    .tab.active { background: var(--blue); color: white; border-color: var(--blue); }
    .tab-desc { font-size: 13px; color: var(--gray-light); margin-bottom: 24px; }

    .story-row {
      background: white; border-radius: 16px; padding: 24px; margin-bottom: 14px;
      border: 1px solid var(--border); transition: box-shadow 0.2s;
    }
    .story-row:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .story-row-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
    .story-row h3 { font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
    .story-row-meta { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .story-tag {
      font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .tag-theme { background: var(--blue-pale); color: var(--blue-dark); }
    .tag-persona { background: #FFF7ED; color: #C2410C; }
    .tag-status { background: #FEF3C7; color: #92400E; }
    .tag-reported { background: #FFE4E6; color: #BE123C; }
    .tag-queued { background: #DCFCE7; color: #166534; }
    .tag-location { background: #F0F9FF; color: #0369A1; }

    .admin-nav {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 48px; border-bottom: 1px solid var(--border); background: white;
    }
    .admin-nav-logo {
      font-family: 'League Spartan', var(--font); font-size: 28px; font-weight: 800;
      color: var(--black); letter-spacing: -0.03em;
    }
    .admin-nav-badge {
      font-family: var(--font); font-size: 12px; font-weight: 600;
      background: var(--blue-pale); color: var(--blue); padding: 4px 10px;
      border-radius: 100px;
    }

    .story-row .original { font-size: 13px; color: var(--gray-light); margin-bottom: 10px; padding: 12px; background: var(--bg); border-radius: 10px; line-height: 1.5; }
    .story-row .original strong { color: var(--gray); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    .story-row .rewritten { font-size: 14px; color: var(--black); line-height: 1.6; margin-bottom: 12px; }
    .story-row .rewritten strong { color: var(--gray); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }

    .story-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn {
      padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: var(--font); transition: all 0.2s; border: none;
    }
    .btn-approve { background: #16A34A; color: white; }
    .btn-approve:hover { background: #15803D; }
    .btn-queue { background: var(--blue); color: white; }
    .btn-queue:hover { background: var(--blue-dark); }
    .btn-publish { background: #7C3AED; color: white; }
    .btn-publish:hover { background: #6D28D9; }
    .btn-edit { background: white; color: var(--blue); border: 1.5px solid var(--blue-light); }
    .btn-edit:hover { background: var(--blue-pale); }
    .btn-reject { background: white; color: #DC2626; border: 1.5px solid #FECACA; }
    .btn-reject:hover { background: #FEF2F2; border-color: #DC2626; }
    .btn-restore { background: var(--blue); color: white; }
    .btn-restore:hover { background: var(--blue-dark); }
    .btn-delete { background: white; color: #DC2626; border: 1.5px solid #FECACA; }
    .btn-delete:hover { background: #FEF2F2; border-color: #DC2626; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-save { background: var(--blue); color: white; }
    .btn-save:hover { background: var(--blue-dark); }
    .btn-cancel { background: white; color: var(--gray); border: 1.5px solid var(--border); }
    .btn-cancel:hover { background: var(--bg); }

    .empty { text-align: center; padding: 60px; color: var(--gray-light); }
    .empty p { font-size: 16px; font-weight: 600; }
    .timestamp { font-size: 11px; color: var(--gray-light); }

    .edit-field { width: 100%; padding: 10px 14px; border: 2px solid var(--border); border-radius: 10px; font-size: 14px; font-family: var(--font); margin-bottom: 8px; background: var(--bg); resize: vertical; }
    .edit-field:focus { outline: none; border-color: var(--blue); }
    .edit-label { font-size: 11px; font-weight: 700; color: var(--gray-light); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .edit-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .edit-row > div { flex: 1; }

    .reports-list { margin: 12px 0; padding: 12px; background: #FEF2F2; border-radius: 10px; border: 1px solid #FECACA; }
    .reports-list-title { font-size: 11px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
    .report-item { font-size: 13px; color: var(--black); padding: 6px 0; border-bottom: 1px solid #FECACA; display: flex; justify-content: space-between; }
    .report-item:last-child { border-bottom: none; }
    .report-reason { flex: 1; }
    .report-date { font-size: 11px; color: var(--gray-light); white-space: nowrap; margin-left: 12px; }

    .queue-info {
      background: var(--blue-pale); border: 1px solid var(--blue-light); border-radius: 12px;
      padding: 14px 18px; margin-bottom: 20px; font-size: 14px; color: var(--blue-dark);
      display: flex; justify-content: space-between; align-items: center;
    }
    .queue-count { font-weight: 700; font-size: 20px; }

    @media (max-width: 768px) {
      .admin-wrap { padding: 20px 16px; }
      .tabs { gap: 4px; }
      .tab { padding: 6px 12px; font-size: 12px; }
      .story-actions { flex-direction: column; }
      .btn { width: 100%; text-align: center; }
      .edit-row { flex-direction: column; }
    }
  `;

  if (!authed) {
    return (
      <div><style>{css}</style>
        <div className="login-card">
          <h1>
            <span style={{ fontFamily: "'League Spartan', var(--font)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Date&Tell</span>
          </h1>
          <p>Admin — enter your password to manage stories</p>
          <input className="login-input" type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === "Enter") login(); }} />
          <button className="login-btn" onClick={login}>Log in</button>
        </div>
      </div>
    );
  }

  return (
    <div><style>{css}</style>
      <div className="admin-nav">
        <span className="admin-nav-logo">Date&Tell</span>
        <span className="admin-nav-badge">Admin</span>
      </div>
      <div className="admin-wrap">
        <div className="admin-header">
          <h1>Story Manager</h1>
          <p>Review, queue, and manage story submissions</p>
        </div>

        <div className="tabs">
          {tabs.map(t => (
            <button key={t.key} className={`tab ${filter === t.key ? "active" : ""}`} onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="tab-desc">{currentTab.desc}</div>

        {filter === "queued" && (
          <div className="queue-info">
            <div>Stories in Friday's queue</div>
            <div className="queue-count">{stories.length} / 6</div>
          </div>
        )}

        {loading ? (
          <div className="empty"><p>Loading...</p></div>
        ) : stories.length === 0 ? (
          <div className="empty"><p>No {currentTab.label.toLowerCase()} stories</p></div>
        ) : (
          stories.map(story => (
            <div className="story-row" key={story.id}>
              {editing === story.id ? (
                <>
                  <div className="edit-label">Title</div>
                  <input className="edit-field" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  <div className="edit-row">
                    <div>
                      <div className="edit-label">Theme</div>
                      <select className="edit-field" value={editTheme} onChange={e => setEditTheme(e.target.value)}>
                        {THEMES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="edit-label">Persona</div>
                      <input className="edit-field" value={editPersona} onChange={e => setEditPersona(e.target.value)} />
                    </div>
                  </div>
                  <div className="edit-label">Rewritten story</div>
                  <textarea className="edit-field" rows={5} value={editText} onChange={e => setEditText(e.target.value)} />
                  {story.original_text && <div className="original"><strong>Original</strong><br/>{story.original_text}</div>}
                  <div className="story-actions" style={{ marginTop: 12 }}>
                    <button className="btn btn-save" onClick={() => saveEdit(story.id)} disabled={actionLoading === story.id}>{actionLoading === story.id ? "..." : "Save"}</button>
                    <button className="btn btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="story-row-header">
                    <h3>{story.title || "Untitled"}</h3>
                    <span className="timestamp">{new Date(story.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <div className="story-row-meta">
                    {story.theme && <span className="story-tag tag-theme">{story.theme}</span>}
                    {story.author_persona && <span className="story-tag tag-persona">{story.author_persona}</span>}
                    {(story.city || story.country) && <span className="story-tag tag-location">📍 {[story.city, story.country].filter(Boolean).join(", ")}</span>}
                    {filter === "queued" && <span className="story-tag tag-queued">Queued</span>}
                    {story.report_count > 0 && <span className="story-tag tag-reported">{story.report_count} report{story.report_count !== 1 ? "s" : ""}</span>}
                  </div>
                  {story.original_text && <div className="original"><strong>Original</strong><br/>{story.original_text}</div>}
                  {story.rewritten_text && <div className="rewritten"><strong>AI rewritten</strong><br/>{story.rewritten_text}</div>}
                  {story.reports && story.reports.length > 0 && (
                    <div className="reports-list">
                      <div className="reports-list-title">Report reasons ({story.reports.length})</div>
                      {story.reports.map((r, i) => (
                        <div className="report-item" key={i}>
                          <span className="report-reason">{r.reason}</span>
                          <span className="report-date">{new Date(r.reported_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="story-actions">
                    <button className="btn btn-edit" onClick={() => startEdit(story)}>Edit</button>

                    {filter === "pending" && (<>
                      <button className="btn btn-approve" onClick={() => updateStatus(story.id, "approved")} disabled={actionLoading === story.id}>{actionLoading === story.id ? "..." : "Approve"}</button>
                      <button className="btn btn-reject" onClick={() => updateStatus(story.id, "rejected")} disabled={actionLoading === story.id}>Reject</button>
                    </>)}

                    {filter === "approved" && (<>
                      <button className="btn btn-queue" onClick={() => updateStatus(story.id, "queued")} disabled={actionLoading === story.id}>{actionLoading === story.id ? "..." : "Add to queue"}</button>
                      <button className="btn btn-reject" onClick={() => updateStatus(story.id, "rejected")} disabled={actionLoading === story.id}>Reject</button>
                    </>)}

                    {filter === "queued" && (<>
                      <button className="btn btn-publish" onClick={() => updateStatus(story.id, "published")} disabled={actionLoading === story.id}>{actionLoading === story.id ? "..." : "Publish now"}</button>
                      <button className="btn btn-cancel" onClick={() => updateStatus(story.id, "approved")} disabled={actionLoading === story.id}>Remove from queue</button>
                    </>)}

                    {filter === "published" && (
                      <button className="btn btn-delete" onClick={() => { if (confirm("Delete this published story? It will be removed from the site immediately.")) updateStatus(story.id, "deleted"); }} disabled={actionLoading === story.id}>{actionLoading === story.id ? "..." : "Delete"}</button>
                    )}

                    {filter === "reported" && (
                      <button className="btn btn-delete" onClick={() => updateStatus(story.id, "deleted")} disabled={actionLoading === story.id}>{actionLoading === story.id ? "..." : "Delete"}</button>
                    )}

                    {filter === "deleted" && (
                      <button className="btn btn-restore" onClick={() => updateStatus(story.id, "approved")} disabled={actionLoading === story.id}>{actionLoading === story.id ? "..." : "Restore"}</button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
