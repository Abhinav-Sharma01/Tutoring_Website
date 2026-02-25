import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";
import toast from "react-hot-toast";

const MyCourses = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/enrollments/my-enrollments");
      setEnrollments(res.data.enrollments || []);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, []);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
    .tp-my * { box-sizing: border-box; }
    @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
    .tp-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: tp-shimmer 1.5s infinite; border-radius: 10px; }
    .tp-card { background: rgba(6,14,24,0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 24px; transition: all 0.35s; backdrop-filter: blur(12px); }
    .tp-card:hover { border-color: rgba(0,212,255,0.15); transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.3); }
    .tp-pill { padding: 8px 18px; border-radius: 100px; font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.25s; border: 1.5px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: rgba(107,143,160,0.9); font-family: 'Cabinet Grotesk', sans-serif; }
    .tp-pill:hover { border-color: rgba(0,212,255,0.25); color: #00d4ff; }
    .tp-pill.active { background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.4); color: #00d4ff; box-shadow: 0 0 16px rgba(0,212,255,0.12); }
    .tp-grid-bg { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 52px 52px; }`;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  const markComplete = async (courseId) => {
    try {
      await api.post("/enrollments/complete", { courseId });
      toast.success("Course marked as completed! 🎉");
      fetchEnrollments();
    } catch { toast.error("Failed to update progress"); }
  };

  const downloadCertificate = async (enrollment) => {
    try {
      const res = await api.post("/certificate/download", {
        courseTitle: enrollment.courseId?.title || "Course",
        studentName: user?.username || "Student",
      }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${enrollment.courseId?.title || "course"}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
      toast.success("Certificate downloaded!");
    } catch { toast.error("Failed to download certificate"); }
  };

  const filtered = filter === "all" ? enrollments : enrollments.filter(e => e.status === filter);
  const tabs = [
    { key: "all", label: "All", count: enrollments.length },
    { key: "active", label: "In Progress", count: enrollments.filter(e => e.status === "active").length },
    { key: "completed", label: "Completed", count: enrollments.filter(e => e.status === "completed").length },
  ];

  const bg = "#030912"; const text = "#e2f5f5"; const muted = "#6b8fa0"; const accent = "#00d4ff";

  if (loading) return (
    <div className="tp-my tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px" }}>
        <div className="tp-skeleton" style={{ width: 200, height: 36, marginBottom: 12 }} />
        <div className="tp-skeleton" style={{ width: 360, height: 20, marginBottom: 40 }} />
        <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>{[...Array(3)].map((_, i) => <div key={i} className="tp-skeleton" style={{ width: 100, height: 40 }} />)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{[...Array(3)].map((_, i) => <div key={i} className="tp-skeleton" style={{ height: 130 }} />)}</div>
      </div>
    </div>
  );

  return (
    <div className="tp-my tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px 80px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16, animation: "tp-fade-up 0.6s ease forwards" }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 4vw, 2.6rem)", margin: "0 0 8px" }}>My Courses</h1>
            <p style={{ color: muted, margin: 0, fontSize: "0.95rem" }}>Track your learning progress and download certificates</p>
          </div>
          <Link to="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 100, background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)", color: "#9bbeca", textDecoration: "none", fontWeight: 700, fontSize: "0.88rem", transition: "all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.25)"; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#9bbeca"; }}
          >+ Browse more</Link>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 32, animation: "tp-fade-up 0.6s ease forwards", animationDelay: "80ms", opacity: 0, animationFillMode: "forwards" }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} className={`tp-pill ${filter === tab.key ? "active" : ""}`}>
              {tab.label} <span style={{ marginLeft: 6, opacity: 0.6 }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, animation: "tp-fade-up 0.5s ease forwards" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📚</div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.6rem", margin: "0 0 10px" }}>No courses found</h3>
            <p style={{ color: muted, margin: "0 0 24px" }}>{filter === "all" ? "You haven't enrolled in any courses yet." : `No ${filter} courses.`}</p>
            <Link to="/courses" style={{ color: accent, textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>Browse courses →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((enrollment, i) => {
              const c = enrollment.courseId;
              const isCompleted = enrollment.status === "completed";
              const progress = isCompleted ? 100 : Math.floor(Math.random() * 60 + 20);
              return (
                <div key={enrollment._id} className="tp-card" style={{ animation: "tp-fade-up 0.5s ease forwards", animationDelay: `${i * 60}ms`, opacity: 0, animationFillMode: "forwards" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <h3 style={{ fontWeight: 800, fontSize: "1rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c?.title ?? "Course"}</h3>
                        <span style={{ flexShrink: 0, padding: "3px 12px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, background: isCompleted ? "rgba(52,211,153,0.12)" : "rgba(0,212,255,0.1)", color: isCompleted ? "#34d399" : accent }}>{isCompleted ? "✓ Completed" : "In Progress"}</span>
                      </div>
                      {c?.category && <p style={{ color: muted, fontSize: "0.85rem", margin: "0 0 12px" }}>{c.category} • {c.level}{c.lessons ? ` • ${c.lessons.length} lesson${c.lessons.length !== 1 ? "s" : ""}` : ""}</p>}
                      <div style={{ maxWidth: 400 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: "0.76rem", color: muted }}>Progress</span>
                          <span style={{ fontSize: "0.76rem", color: isCompleted ? "#34d399" : accent, fontWeight: 700 }}>{progress}%</span>
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 100, background: isCompleted ? "linear-gradient(90deg, #34d399, #059669)" : `linear-gradient(90deg, ${accent}, #0094ff)`, width: `${progress}%`, transition: "width 1s ease" }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                      {!isCompleted && (
                        <button onClick={() => markComplete(c?._id)} style={{ padding: "10px 20px", borderRadius: 100, background: `linear-gradient(135deg, ${accent}, #0094ff)`, border: "none", color: "#001820", fontWeight: 800, fontSize: "0.84rem", cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", boxShadow: `0 4px 20px rgba(0,212,255,0.3)`, transition: "all 0.3s" }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 30px rgba(0,212,255,0.45)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,255,0.3)"; }}
                        >Mark Complete</button>
                      )}
                      {isCompleted && (
                        <button onClick={() => downloadCertificate(enrollment)} style={{ padding: "10px 20px", borderRadius: 100, background: "linear-gradient(135deg, #34d399, #059669)", border: "none", color: "#001820", fontWeight: 800, fontSize: "0.84rem", cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", boxShadow: "0 4px 20px rgba(52,211,153,0.3)", transition: "all 0.3s" }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >🎓 Certificate</button>
                      )}
                      <Link to={`/course/${c?._id}`} style={{ padding: "10px 20px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", color: "#9bbeca", textDecoration: "none", fontWeight: 600, fontSize: "0.84rem", transition: "all 0.3s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.2)"; e.currentTarget.style.color = accent; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#9bbeca"; }}
                      >View</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;