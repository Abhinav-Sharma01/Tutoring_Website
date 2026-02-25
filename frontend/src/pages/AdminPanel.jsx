import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/auth-context";

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/courses"),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const s = document.createElement("style");
    s.id = "tp-admin-styles";
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
    .tp-admin * { box-sizing: border-box; }
    @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
    .tp-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: tp-shimmer 1.5s infinite; border-radius: 10px; }
    .tp-grid-bg { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 52px 52px; }
    .tp-search { width: 100%; padding: 10px 16px 10px 40px; background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.07); border-radius: 12px; color: #e2f5f5; font-family: 'Cabinet Grotesk', sans-serif; font-size: 0.88rem; outline: none; transition: all 0.3s; }
    .tp-search::placeholder { color: rgba(107,143,160,0.5); }
    .tp-search:focus { border-color: rgba(0,212,255,0.35); background: rgba(0,212,255,0.03); box-shadow: 0 0 0 3px rgba(0,212,255,0.07); }`;
    document.head.appendChild(s);
    return () => { const el = document.getElementById("tp-admin-styles"); if (el) el.remove(); };
  }, []);

  const deleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the platform?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User removed");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user");
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      toast.success("Course deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const bg = "#030912";
  const text = "#e2f5f5";
  const muted = "#6b8fa0";
  const accent = "#00d4ff";

  const filteredUsers = searchQuery
    ? users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;
  const filteredCourses = searchQuery
    ? courses.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : courses;

  const students = users.filter(u => u.role === "student");
  const tutors = users.filter(u => u.role === "tutor");

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const recentUsers = [...users]
    .filter(u => new Date(u.createdAt) >= twoDaysAgo)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "users", label: `👥 All Users (${users.length})` },
    { key: "students", label: `👨‍🎓 Students (${students.length})` },
    { key: "tutors", label: `👨‍🏫 Tutors (${tutors.length})` },
    { key: "courses", label: `📚 Courses (${courses.length})` },
  ];

  if (loading) return (
    <div className="tp-admin tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px" }}>
        <div className="tp-skeleton" style={{ width: 280, height: 36, marginBottom: 48 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="tp-skeleton" style={{ height: 120 }} />)}
        </div>
        <div className="tp-skeleton" style={{ height: 300 }} />
      </div>
    </div>
  );

  const roleColor = { admin: "#f87171", tutor: "#a78bfa", student: accent };

  return (
    <div className="tp-admin tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, padding: "0 0 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16, animation: "tp-fade-up 0.6s ease" }}>
          <div>
            <div style={{ display: "inline-flex", items: "center", gap: 8, padding: "5px 14px", borderRadius: 100, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", marginBottom: 12, fontSize: "0.75rem", color: "#f87171", fontWeight: 700 }}>
              🛡️ Admin Panel
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "0 0 6px" }}>
              Welcome, {user?.username || "Admin"}
            </h1>
            <p style={{ color: muted, margin: 0, fontSize: "0.9rem" }}>Manage your platform, users, and courses</p>
          </div>
          <Link to="/create-course" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 100, background: `linear-gradient(135deg, ${accent}, #0094ff)`, color: "#001820", textDecoration: "none", fontWeight: 800, fontSize: "0.85rem", boxShadow: "0 4px 24px rgba(0,212,255,0.3)" }}>+ New Course</Link>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearchQuery(""); }} style={{
              padding: "8px 20px", borderRadius: 100, fontSize: "0.84rem", fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${tab === t.key ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              background: tab === t.key ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.03)",
              color: tab === t.key ? accent : muted,
              fontFamily: "'Cabinet Grotesk', sans-serif", transition: "all 0.25s",
              boxShadow: tab === t.key ? "0 0 16px rgba(0,212,255,0.12)" : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ animation: "tp-fade-up 0.5s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 36 }}>
              {[
                { label: "Total Users", value: users.length, icon: "👥", color: accent, target: "users" },
                { label: "Students", value: students.length, icon: "🎓", color: "#34d399", target: "students" },
                { label: "Tutors", value: tutors.length, icon: "📚", color: "#a78bfa", target: "tutors" },
                { label: "Total Courses", value: courses.length, icon: "📘", color: "#fbbf24", target: "courses" },
              ].map((card, i) => (
                <div key={i} onClick={() => { setTab(card.target); setSearchQuery(""); }} style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 20px", backdropFilter: "blur(12px)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.2)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.3rem" }}>{card.icon}</span>
                      <span style={{ color: muted, fontSize: "0.82rem", fontWeight: 600 }}>{card.label}</span>
                    </div>
                    <span style={{ color: card.color, fontSize: "0.8rem", opacity: 0.7 }}>View →</span>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px 24px", backdropFilter: "blur(12px)" }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
                🔔 Recent Registrations (Past 48 Hours)
              </h2>
              {recentUsers.length === 0 ? (
                <p style={{ color: muted }}>No users registered yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentUsers.map((u, i) => (
                    <div key={u._id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${roleColor[u.role] || accent}, ${roleColor[u.role] || accent}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", color: "#fff" }}>
                          {u.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{u.username}</div>
                          <div style={{ color: muted, fontSize: "0.78rem" }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: "0.7rem", fontWeight: 700, background: `${roleColor[u.role] || accent}18`, color: roleColor[u.role] || accent, border: `1px solid ${roleColor[u.role] || accent}30` }}>
                          {u.role}
                        </span>
                        <span style={{ color: muted, fontSize: "0.72rem" }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div style={{ animation: "tp-fade-up 0.5s ease" }}>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input className="tp-search" placeholder="Search all users by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredUsers.map((u, i) => (
                <div key={u._id || i} style={{ padding: "14px 20px", borderRadius: 16, background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${roleColor[u.role] || accent}, ${roleColor[u.role] || accent}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", color: "#fff" }}>
                        {u.username?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{u.username}</div>
                        <div style={{ color: muted, fontSize: "0.8rem" }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, background: `${roleColor[u.role] || accent}18`, color: roleColor[u.role] || accent, border: `1px solid ${roleColor[u.role] || accent}30`, textTransform: "capitalize" }}>
                        {u.role}
                      </span>
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </span>
                      <button onClick={() => deleteUser(u._id, u.username)} style={{ padding: "5px 14px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", transition: "all 0.2s" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  {u.enrolledCourses && u.enrolledCourses.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ color: "#34d399", fontSize: "0.72rem", fontWeight: 700 }}>Enrolled:</span>
                      {u.enrolledCourses.map((c, ci) => (
                        <span key={ci} style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", color: "#34d399", fontSize: "0.7rem" }}>{c}</span>
                      ))}
                    </div>
                  )}
                  {u.createdCourses && u.createdCourses.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ color: "#a78bfa", fontSize: "0.72rem", fontWeight: 700 }}>Teaching:</span>
                      {u.createdCourses.map((c, ci) => (
                        <span key={ci} style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)", color: "#a78bfa", fontSize: "0.7rem" }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredUsers.length === 0 && <p style={{ color: muted, textAlign: "center", padding: 40 }}>No users found.</p>}
            </div>
          </div>
        )}

        {tab === "students" && (
          <div style={{ animation: "tp-fade-up 0.5s ease" }}>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input className="tp-search" placeholder="Search students by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredUsers.filter(u => u.role === "student").map((u, i) => (
                <div key={u._id || i} style={{ padding: "14px 20px", borderRadius: 16, background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${roleColor[u.role] || accent}, ${roleColor[u.role] || accent}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", color: "#fff" }}>
                        {u.username?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{u.username}</div>
                        <div style={{ color: muted, fontSize: "0.8rem" }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </span>
                      <button onClick={() => deleteUser(u._id, u.username)} style={{ padding: "5px 14px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", transition: "all 0.2s" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  {u.enrolledCourses && u.enrolledCourses.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ color: "#34d399", fontSize: "0.72rem", fontWeight: 700 }}>Enrolled:</span>
                      {u.enrolledCourses.map((c, ci) => (
                        <span key={ci} style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", color: "#34d399", fontSize: "0.7rem" }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredUsers.filter(u => u.role === "student").length === 0 && <p style={{ color: muted, textAlign: "center", padding: 40 }}>No students found.</p>}
            </div>
          </div>
        )}

        {tab === "tutors" && (
          <div style={{ animation: "tp-fade-up 0.5s ease" }}>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input className="tp-search" placeholder="Search tutors by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredUsers.filter(u => u.role === "tutor").map((u, i) => (
                <div key={u._id || i} style={{ padding: "14px 20px", borderRadius: 16, background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${roleColor[u.role] || accent}, ${roleColor[u.role] || accent}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", color: "#fff" }}>
                        {u.username?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{u.username}</div>
                        <div style={{ color: muted, fontSize: "0.8rem" }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </span>
                      <button onClick={() => deleteUser(u._id, u.username)} style={{ padding: "5px 14px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", transition: "all 0.2s" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  {u.createdCourses && u.createdCourses.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ color: "#a78bfa", fontSize: "0.72rem", fontWeight: 700 }}>Teaching:</span>
                      {u.createdCourses.map((c, ci) => (
                        <span key={ci} style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)", color: "#a78bfa", fontSize: "0.7rem" }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredUsers.filter(u => u.role === "tutor").length === 0 && <p style={{ color: muted, textAlign: "center", padding: 40 }}>No tutors found.</p>}
            </div>
          </div>
        )}

        {tab === "courses" && (
          <div style={{ animation: "tp-fade-up 0.5s ease" }}>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input className="tp-search" placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredCourses.map((c, i) => (
                <div key={c._id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 16, background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{c.title}</div>
                    <div style={{ color: muted, fontSize: "0.8rem" }}>
                      By {c.tutorId?.username || "Unknown"} · {c.category} · {c.level} · ₹{c.price}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => deleteCourse(c._id)} style={{ padding: "6px 16px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk',sans-serif" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredCourses.length === 0 && <p style={{ color: muted, textAlign: "center", padding: 40 }}>No courses found.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;