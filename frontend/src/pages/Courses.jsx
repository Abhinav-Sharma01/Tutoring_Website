import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "tp-courses-styles";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
      .tp-courses * { box-sizing: border-box; }

      @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
      @keyframes tp-glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
      @keyframes tp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes tp-skeleton { 0%{background-position:-200%} 100%{background-position:200%} }

      .tp-course-card-grid {
        background: rgba(6,14,24,0.85);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 20px; overflow: hidden;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        text-decoration: none; color: inherit; display: block;
        will-change: transform;
      }
      .tp-course-card-grid:hover {
        transform: translateY(-8px) scale(1.01);
        border-color: rgba(0,212,255,0.18);
        box-shadow: 0 28px 64px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.05);
      }

      .tp-course-card-list {
        background: rgba(6,14,24,0.85);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px; overflow: hidden;
        transition: all 0.35s ease;
        text-decoration: none; color: inherit; display: flex;
        align-items: stretch;
      }
      .tp-course-card-list:hover {
        border-color: rgba(0,212,255,0.15);
        transform: translateX(4px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.35);
      }

      .tp-filter-pill {
        padding: 8px 18px; border-radius: 100px;
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.84rem; font-weight: 700;
        cursor: pointer; transition: all 0.25s ease;
        border: 1.5px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        color: rgba(107,143,160,0.9); white-space: nowrap;
        text-transform: capitalize;
      }
      .tp-filter-pill:hover { border-color: rgba(0,212,255,0.25); color: rgba(0,212,255,0.8); background: rgba(0,212,255,0.05); }
      .tp-filter-pill.active {
        background: rgba(0,212,255,0.12);
        border-color: rgba(0,212,255,0.4);
        color: #00d4ff;
        box-shadow: 0 0 16px rgba(0,212,255,0.15);
      }

      .tp-search-input {
        width: 100%; padding: 14px 20px 14px 52px;
        background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.07);
        border-radius: 100px; color: #e2f5f5;
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.95rem; outline: none; transition: all 0.3s ease;
      }
      .tp-search-input::placeholder { color: rgba(107,143,160,0.5); }
      .tp-search-input:focus {
        border-color: rgba(0,212,255,0.35);
        background: rgba(0,212,255,0.03);
        box-shadow: 0 0 0 4px rgba(0,212,255,0.07);
      }

      .tp-gradient-text {
        background: linear-gradient(135deg, #00d4ff, #a78bfa);
        background-size: 200% auto; -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text;
        animation: tp-shimmer 3s linear infinite;
      }

      .tp-skeleton {
        background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
        background-size: 200% 100%;
        animation: tp-skeleton 1.5s infinite;
        border-radius: 8px;
      }

      .tp-grid-bg {
        background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px);
        background-size: 52px 52px;
      }

      .tp-view-btn {
        width: 38px; height: 38px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        border: 1.5px solid rgba(255,255,255,0.08);
        background: transparent; cursor: pointer;
        color: rgba(107,143,160,0.8); transition: all 0.25s;
      }
      .tp-view-btn.active {
        background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.3); color: #00d4ff;
      }
      .tp-view-btn:hover { border-color: rgba(0,212,255,0.2); color: #00d4ff; }
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById("tp-courses-styles"); if (el) el.remove(); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data.courses || res.data || []);
      } catch { setCourses([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const lc = (s) => (s || "").toLowerCase();
  const filtered = courses.filter(c => {
    if (search && !lc(c.title).includes(lc(search)) && !lc(c.description).includes(lc(search))) return false;
    if (category !== "all" && lc(c.category) !== lc(category)) return false;
    if (level !== "all" && lc(c.level) !== lc(level)) return false;
    return true;
  });

  const categories = ["all", ...new Set(courses.map(c => c.category).filter(Boolean))];
  const levels = ["all", "beginner", "intermediate", "advanced"];
  const clearFilters = () => { setSearch(""); setCategory("all"); setLevel("all"); };
  const hasFilters = search || category !== "all" || level !== "all";

  const bg = "#030912";
  const text = "#e2f5f5";
  const muted = "#6b8fa0";

  const thumbGrads = [
    "linear-gradient(135deg, #0d1f3c, #1a3a7c)",
    "linear-gradient(135deg, #0e0018, #2d0e50)",
    "linear-gradient(135deg, #001820, #005a4a)",
    "linear-gradient(135deg, #1a0a00, #5a2800)",
    "linear-gradient(135deg, #001020, #003060)",
    "linear-gradient(135deg, #0a0820, #1e1060)",
  ];
  const thumbEmojis = ["📘", "🤖", "🎨", "📊", "⚡", "🔬"];

  if (loading) return (
    <div className="tp-courses tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px" }}>
        <div className="tp-skeleton" style={{ width: 320, height: 52, marginBottom: 16 }} />
        <div className="tp-skeleton" style={{ width: 460, height: 24, marginBottom: 56 }} />
        <div className="tp-skeleton" style={{ width: "100%", height: 56, borderRadius: 100, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="tp-skeleton" style={{ height: 190, borderRadius: 0 }} />
              <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8 }}><div className="tp-skeleton" style={{ width: 80, height: 26 }} /><div className="tp-skeleton" style={{ width: 70, height: 26 }} /></div>
                <div className="tp-skeleton" style={{ width: "75%", height: 20 }} />
                <div className="tp-skeleton" style={{ width: "55%", height: 16 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="tp-courses tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>

      {/* Header */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "64px 32px 56px" }}>
        <div style={{ position: "absolute", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)", top: 0, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", animation: "tp-glow-pulse 8s ease-in-out infinite" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 100, background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.18)", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
            <span style={{ fontSize: "0.76rem", color: "#7de8f5", fontWeight: 700, letterSpacing: "0.08em" }}>{courses.length} COURSES AVAILABLE</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", margin: "0 0 16px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Explore All{" "}<em className="tp-gradient-text" style={{ fontStyle: "normal" }}>Courses</em>
          </h1>
          <p style={{ color: muted, fontSize: "1.05rem", margin: "0 0 48px", lineHeight: 1.7, maxWidth: 500 }}>
            Discover your next skill. Browse expert-crafted courses across tech, design, data, and beyond.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: 680, position: "relative" }}>
            <svg style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" className="tp-search-input" placeholder="Search by title, topic, or keyword…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.06)", border: "none", color: muted, cursor: "pointer", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", transition: "all 0.2s" }}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 80px" }}>

        {/* Filters */}
        <div style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 28px", marginBottom: 36, backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
            {/* Category */}
            <div style={{ flex: "1 1 auto" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#5aafb8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Category</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`tp-filter-pill ${category === cat ? "active" : ""}`}>
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: "rgba(255,255,255,0.06)", alignSelf: "stretch", minHeight: 60 }} />

            {/* Level */}
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#5aafb8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Level</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {levels.map(lev => (
                  <button key={lev} onClick={() => setLevel(lev)} className={`tp-filter-pill ${level === lev ? "active" : ""}`}>
                    {lev === "all" ? "All Levels" : lev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: text, fontWeight: 700, fontSize: "1rem" }}>
              <span style={{ color: "#00d4ff" }}>{filtered.length}</span> {filtered.length === 1 ? "course" : "courses"} found
            </span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(248,113,113,0.09)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", transition: "all 0.25s" }}>
                Clear filters ✕
              </button>
            )}
          </div>
          {/* View mode toggle */}
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`tp-view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </button>
            <button className={`tp-view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* Courses */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24 }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.8rem", margin: "0 0 12px" }}>No courses found</h3>
            <p style={{ color: muted, margin: "0 0 28px" }}>Try adjusting your search terms or clearing the filters.</p>
            <button onClick={clearFilters} style={{ padding: "12px 28px", borderRadius: 100, background: "rgba(0,212,255,0.1)", border: "1.5px solid rgba(0,212,255,0.25)", color: "#00d4ff", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "0.9rem" }}>
              Clear all filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {filtered.map((course, i) => (
              <Link key={course._id} to={`/course/${course._id}`} className="tp-course-card-grid" style={{ animationDelay: `${i * 50}ms`, animation: "tp-fade-up 0.5s ease forwards", opacity: 0, animationFillMode: "forwards" }}>
                {/* Thumbnail */}
                <div style={{ height: 195, background: thumbGrads[i % 6], position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                  ) : (
                    <span style={{ fontSize: "3.2rem", opacity: 0.9 }}>{thumbEmojis[i % 6]}</span>
                  )}
                  {/* Hover overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)", opacity: 0, transition: "opacity 0.35s" }} className="tp-thumb-overlay" />
                  {/* Price badge */}
                  <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(3,9,18,0.88)", backdropFilter: "blur(10px)", border: "1px solid rgba(0,212,255,0.2)", padding: "5px 14px", borderRadius: 100, fontSize: "0.82rem", fontWeight: 800, color: "#00d4ff", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    {course.price ? `₹${course.price}` : <span style={{ color: "#34d399" }}>Free</span>}
                  </div>
                  {/* Level badge */}
                  <div style={{ position: "absolute", bottom: 14, left: 14, background: "rgba(3,9,18,0.75)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, color: "#8ab0bf", textTransform: "capitalize" }}>
                    {course.level || "All levels"}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "20px 22px 24px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", color: "#7de8f5", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em" }}>{course.category || "General"}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "1rem", margin: "0 0 10px", lineHeight: 1.4, color: text, fontFamily: "'Cabinet Grotesk', sans-serif", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{course.title}</h3>
                  <p style={{ color: "#6b8fa0", fontSize: "0.86rem", lineHeight: 1.65, margin: "0 0 16px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{course.description}</p>

                  {course.tutorId && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #00d4ff, #0094ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 800, color: "#001", flexShrink: 0 }}>
                          {(course.tutorId.username || "I")[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: "0.82rem", color: muted }}>{course.tutorId.username || "Instructor"}</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#5aafb8", fontWeight: 600 }}>View →</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // LIST VIEW
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((course, i) => (
              <Link key={course._id} to={`/course/${course._id}`} className="tp-course-card-list" style={{ animationDelay: `${i * 40}ms`, animation: "tp-fade-up 0.5s ease forwards", opacity: 0, animationFillMode: "forwards" }}>
                {/* Thumb */}
                <div style={{ width: 160, minHeight: 110, background: thumbGrads[i % 6], flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : thumbEmojis[i % 6]}
                </div>
                {/* Content */}
                <div style={{ padding: "18px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(0,212,255,0.08)", color: "#7de8f5", fontSize: "0.71rem", fontWeight: 700 }}>{course.category || "General"}</span>
                    <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(255,255,255,0.05)", color: "#8ab0bf", fontSize: "0.71rem", fontWeight: 600, textTransform: "capitalize" }}>{course.level || "All levels"}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "1rem", margin: "0 0 6px", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>{course.title}</h3>
                  <p style={{ color: muted, fontSize: "0.85rem", margin: "0 0 12px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", lineHeight: 1.5 }}>{course.description}</p>
                  {course.tutorId && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #00d4ff, #0094ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, color: "#001" }}>
                        {(course.tutorId.username || "I")[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: muted }}>{course.tutorId.username}</span>
                    </div>
                  )}
                </div>
                {/* Price + Action */}
                <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: 12, borderLeft: "1px solid rgba(255,255,255,0.05)", minWidth: 140 }}>
                  <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#00d4ff" }}>
                    {course.price ? `₹${course.price}` : <span style={{ color: "#34d399" }}>Free</span>}
                  </div>
                  <div style={{ padding: "8px 16px", borderRadius: 100, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", fontSize: "0.82rem", fontWeight: 700 }}>View Course →</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        {filtered.length > 6 && (
          <div style={{ textAlign: "center", marginTop: 64, padding: "60px 32px", background: "rgba(6,14,24,0.6)", border: "1px solid rgba(0,212,255,0.08)", borderRadius: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 400, height: 300, background: "radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2rem", margin: "0 0 12px" }}>
              Can't find what you're looking for?
            </h3>
            <p style={{ color: muted, margin: "0 0 28px" }}>Our catalog grows every week. Check back soon or request a course topic.</p>
            <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 36px", borderRadius: 100, background: "linear-gradient(135deg, #00d4ff, #0094ff)", color: "#001820", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 30px rgba(0,212,255,0.3)" }}>
              Request a Course
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
