import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";
import toast from "react-hot-toast";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeLesson, setActiveLesson] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Rename states
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          api.get(`/courses/${id}`),
          api.get(`/reviews/${id}`).catch(() => ({ data: { reviews: [] } })),
        ];
        if (user) {
          promises.push(
            api.get(`/enrollments/check/${id}`).catch(() => ({ data: { enrolled: false } }))
          );
        }
        const [courseRes, reviewsRes, checkRes] = await Promise.all(promises);
        setCourse(courseRes.data.course || courseRes.data);
        setEditCourseTitle((courseRes.data.course || courseRes.data).title);
        setReviews(reviewsRes.data.reviews || []);
        if (checkRes) setIsEnrolled(checkRes.data.enrolled);
      } catch (err) {
        toast.error("Course not found");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handlePayment = async () => {
    if (!user) { toast.error("Please log in to enroll"); navigate("/login"); return; }
    if (!course) return;
    try {
      setLoading(true);
      const orderRes = await api.post("/payment/create-order", { amount: course.price, courseId: id });
      const { order, enrollmentId } = orderRes.data;
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key) { toast.error("Payment is not configured"); return; }
      const options = {
        key, amount: order.amount, currency: order.currency,
        name: "TutorPro", description: course.title, order_id: order.id,
        handler: async function (response) {
          try {
            await api.post("/payment/verify", { ...response, enrollmentId });
            toast.success("Payment successful! 🎉");
            navigate("/my-courses");
          } catch { toast.error("Verification failed"); }
        },
        modal: { ondismiss: function () { setLoading(false); toast("Payment cancelled"); } },
        theme: { color: "#00d4ff" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally { setLoading(false); }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonVideo) return toast.error("Title and video are required");

    setUploadingVideo(true);
    try {
      // 1. Upload video to Cloudinary
      const formData = new FormData();
      formData.append("video", newLessonVideo);
      const uploadRes = await api.post("/upload/video", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const videoUrl = uploadRes.data.videoUrl;

      // 2. Append new lesson to existing course
      const finalDuration = newLessonDuration.trim() !== "" ? newLessonDuration : "0 min";
      const newLesson = { title: newLessonTitle, duration: finalDuration, videoUrl };
      const updatedLessons = [...course.lessons, newLesson];

      const updateRes = await api.put(`/courses/${id}`, { lessons: updatedLessons });

      // 3. Update local state
      setCourse(updateRes.data.course);
      setShowAddLesson(false);
      setNewLessonTitle("");
      setNewLessonDuration("");
      setNewLessonVideo(null);
      toast.success("Lesson added successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add lesson");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteLesson = async (e, lessonIndex) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) return;

    try {
      const updatedLessons = course.lessons.filter((_, i) => i !== lessonIndex);
      const res = await api.put(`/courses/${id}`, { lessons: updatedLessons });
      setCourse(res.data.course);

      if (activeLesson === lessonIndex) setActiveLesson(0);
      else if (activeLesson > lessonIndex) setActiveLesson(activeLesson - 1);

      toast.success("Lesson deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete lesson");
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you absolutely sure you want to PERMANENTLY delete this entire course? This action cannot be undone.")) return;

    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted successfully");
      navigate("/courses");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course");
    }
  };

  const handleRenameCourse = async () => {
    if (!editCourseTitle.trim()) return toast.error("Course title cannot be empty");
    try {
      const res = await api.put(`/courses/${id}`, { title: editCourseTitle });
      setCourse(res.data.course);
      setIsEditingCourse(false);
      toast.success("Course renamed! Enrolled students will be notified.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename course");
    }
  };

  const handleRenameLesson = async (index) => {
    if (!editLessonTitle.trim()) return toast.error("Lesson title cannot be empty");
    try {
      const updatedLessons = [...course.lessons];
      updatedLessons[index].title = editLessonTitle;

      const res = await api.put(`/courses/${id}`, { lessons: updatedLessons });
      setCourse(res.data.course);
      setEditingLessonIndex(null);
      toast.success("Lesson renamed! Enrolled students will be notified.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename lesson");
    }
  };

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
    .tp-cd * { box-sizing: border-box; }
    @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tp-shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
    @keyframes tp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes tp-glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
    .tp-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: tp-shimmer 1.5s infinite; border-radius: 10px; }
    .tp-card { background: rgba(6,14,24,0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 28px; backdrop-filter: blur(12px); }
    .tp-grid-bg { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 52px 52px; }
    .tp-gradient-text { background: linear-gradient(135deg, #00d4ff, #a78bfa); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: tp-shimmer 3s linear infinite; }
    .tp-lesson-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s; }
    .tp-lesson-row:hover { background: rgba(0,212,255,0.03); }
    .tp-lesson-row:last-child { border-bottom: none; }`;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  const bg = "#030912"; const text = "#e2f5f5"; const muted = "#6b8fa0"; const accent = "#00d4ff";

  if (pageLoading) return (
    <div className="tp-cd tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>
      <div style={{ background: "linear-gradient(135deg, #001828, #001a30)", padding: "60px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 500, height: 300, background: "radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)", top: 0, right: 0, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}><div className="tp-skeleton" style={{ width: 80, height: 28 }} /><div className="tp-skeleton" style={{ width: 90, height: 28 }} /></div>
          <div className="tp-skeleton" style={{ width: "60%", height: 42, marginBottom: 12 }} />
          <div className="tp-skeleton" style={{ width: "40%", height: 20 }} />
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        <div><div className="tp-skeleton" style={{ height: 260, marginBottom: 20 }} /><div className="tp-skeleton" style={{ height: 200 }} /></div>
        <div className="tp-skeleton" style={{ height: 320 }} />
      </div>
    </div>
  );

  if (!course) return (
    <div className="tp-cd tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", animation: "tp-fade-up 0.5s ease" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>📚</div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.8rem", margin: "0 0 10px" }}>Course not found</h2>
        <p style={{ color: muted, margin: "0 0 20px" }}>This course may have been removed or doesn't exist.</p>
        <button onClick={() => navigate("/courses")} style={{ color: accent, background: "none", border: "none", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif" }}>Browse courses →</button>
      </div>
    </div>
  );

  const tutor = course.tutorId;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const ratingDist = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    return { star, count, pct: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
  });

  const canEdit = user && course && (user.role === "admin" || (user.role === "tutor" && course.tutorId?._id === user.id));

  return (
    <div className="tp-cd tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text }}>

      {/* Breadcrumb */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "12px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: muted }}>
          <Link to="/" style={{ color: muted, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = muted}>Home</Link>
          <span>›</span>
          <Link to="/courses" style={{ color: muted, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = muted}>Courses</Link>
          <span>›</span>
          <span style={{ color: text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{course.title}</span>
        </div>
      </div>

      {/* Hero header */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #001828 0%, #00121c 50%, #001a2a 100%)", borderBottom: "1px solid rgba(0,212,255,0.08)", padding: "56px 32px" }}>
        <div style={{ position: "absolute", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)", top: "-60px", right: "-60px", pointerEvents: "none", animation: "tp-glow-pulse 7s ease-in-out infinite" }} />
        <div className="tp-grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            <span style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)", color: "#7de8f5", fontSize: "0.78rem", fontWeight: 700, textTransform: "capitalize" }}>{course.category}</span>
            <span style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8ab0bf", fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize" }}>{course.level}</span>
            {avgRating && (
              <span style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: "0.78rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                ★ {avgRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {isEditingCourse ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <input
                  type="text"
                  value={editCourseTitle}
                  onChange={e => setEditCourseTitle(e.target.value)}
                  autoFocus
                  style={{ flex: 1, maxWidth: 600, padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: `1px solid ${accent}`, color: text, fontSize: "1.5rem", fontFamily: "'Instrument Serif', serif" }}
                />
                <button onClick={handleRenameCourse} style={{ padding: "8px 16px", borderRadius: 8, background: accent, border: "none", color: "#001820", fontWeight: 700, cursor: "pointer" }}>Save</button>
                <button onClick={() => { setIsEditingCourse(false); setEditCourseTitle(course.title); }} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", color: text, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              </div>
            ) : (
              <>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", margin: 0, lineHeight: 1.1 }}>{course.title}</h1>
                {canEdit && (
                  <button onClick={() => setIsEditingCourse(true)} style={{ background: "rgba(0,212,255,0.1)", border: "1px dashed rgba(0,212,255,0.4)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: accent, cursor: "pointer", transition: "all 0.2s" }} title="Edit Course Title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                )}
              </>
            )}
          </div>

          <p style={{ color: "#8ab0bf", fontSize: "1.05rem", maxWidth: 700, lineHeight: 1.7, margin: "0 0 24px" }}>{course.description}</p>
          {tutor && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #0094ff)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#001820", fontWeight: 800, fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(0,212,255,0.3)" }}>{tutor.username?.charAt(0)?.toUpperCase() || "?"}</div>
              <div>
                <p style={{ fontWeight: 700, margin: "0 0 2px", fontSize: "0.92rem" }}>{tutor.username}</p>
                <p style={{ color: muted, fontSize: "0.82rem", margin: 0 }}>{tutor.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>
          {/* Main */}
          <div>
            {/* What you'll learn */}
            <div className="tp-card" style={{ marginBottom: 24, animation: "tp-fade-up 0.5s ease forwards" }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#34d399" }}>✓</span> What you'll learn
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {["Build real-world projects from scratch", "Understand core concepts deeply", "Apply best practices and patterns", "Gain confidence in your skills", "Get hands-on experience", "Earn a certificate of completion"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" style={{ marginTop: 3, flexShrink: 0 }}><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span style={{ color: muted, fontSize: "0.88rem", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons & Video Player */}
            {course.lessons && (course.lessons.length > 0 || canEdit) && (
              <div className="tp-card" style={{ padding: 0, marginBottom: 24, animation: "tp-fade-up 0.5s ease forwards", animationDelay: "100ms", opacity: 0, animationFillMode: "forwards", overflow: "hidden" }}>

                {/* Video Player */}
                {isEnrolled && course.lessons[activeLesson]?.videoUrl && (
                  <div style={{ background: "#000", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", paddingTop: "56.25%" }}>
                    <video
                      key={course.lessons[activeLesson].videoUrl}
                      controls
                      controlsList="nodownload"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
                      src={course.lessons[activeLesson].videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(6,14,24,0.3)" }}>
                  <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: 0 }}>Course Content</h2>
                  <span style={{ fontSize: "0.82rem", color: muted, fontWeight: 600 }}>{course.lessons.length} lesson{course.lessons.length !== 1 ? "s" : ""}</span>
                </div>
                {course.lessons.map((lesson, i) => (
                  <div
                    key={i}
                    className="tp-lesson-row"
                    onClick={() => isEnrolled && setActiveLesson(i)}
                    style={{
                      cursor: isEnrolled ? "pointer" : "default",
                      background: activeLesson === i && isEnrolled ? "rgba(0,212,255,0.05)" : "transparent",
                      borderLeft: activeLesson === i && isEnrolled ? `3px solid ${accent}` : "3px solid transparent",
                      paddingLeft: activeLesson === i && isEnrolled ? "17px" : "20px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: activeLesson === i && isEnrolled ? `linear-gradient(135deg, ${accent}, #0094ff)` : "rgba(0,212,255,0.08)", border: activeLesson === i && isEnrolled ? "none" : "1px solid rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: activeLesson === i && isEnrolled ? "#001820" : accent, fontSize: "0.78rem", fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>

                      {editingLessonIndex === i ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }} onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editLessonTitle}
                            onChange={e => setEditLessonTitle(e.target.value)}
                            autoFocus
                            style={{ flex: 1, padding: "6px 10px", borderRadius: 6, background: "rgba(0,0,0,0.4)", border: `1px solid ${accent}`, color: text, fontSize: "0.9rem" }}
                          />
                          <button onClick={(e) => { e.stopPropagation(); handleRenameLesson(i); }} style={{ padding: "4px 10px", borderRadius: 6, background: accent, border: "none", color: "#001820", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>Save</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingLessonIndex(null); }} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.1)", border: "none", color: text, fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontWeight: (activeLesson === i && isEnrolled) ? 800 : 700, color: (activeLesson === i && isEnrolled) ? "#fff" : text, fontSize: "0.9rem", display: "block", transition: "all 0.2s" }}>{lesson.title}</span>
                          {lesson.duration && <span style={{ fontSize: "0.76rem", color: (activeLesson === i && isEnrolled) ? "#a2c1d1" : muted }}>{lesson.duration}</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {isEnrolled ? (
                        <span style={{ color: activeLesson === i ? accent : muted, fontSize: "0.85rem", fontWeight: activeLesson === i ? 700 : 400 }}>{activeLesson === i ? "▶ Playing" : "▶"}</span>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.85rem" }}>🔒</span>
                      )}

                      {/* Edit Lesson Button (Only for Admins/Tutors) */}
                      {canEdit && editingLessonIndex !== i && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingLessonIndex(i); setEditLessonTitle(lesson.title); }}
                          style={{
                            background: "none", border: "none", padding: "6px",
                            color: "rgba(0,212,255,0.5)", cursor: "pointer",
                            transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#00d4ff"; e.currentTarget.style.transform = "scale(1.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(0,212,255,0.5)"; e.currentTarget.style.transform = "scale(1)"; }}
                          title="Rename Lesson"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                      )}

                      {/* Delete Lesson Button (Only for Admins/Tutors) */}
                      {canEdit && (
                        <button
                          onClick={(e) => handleDeleteLesson(e, i)}
                          style={{
                            background: "none", border: "none", padding: "6px",
                            color: "rgba(248,113,113,0.5)", cursor: "pointer",
                            transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.transform = "scale(1.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(248,113,113,0.5)"; e.currentTarget.style.transform = "scale(1)"; }}
                          title="Delete Lesson"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Lesson Button for Instructors/Admins */}
                {canEdit && (
                  <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,212,255,0.02)" }}>
                    <button
                      onClick={() => setShowAddLesson(true)}
                      style={{ width: "100%", padding: "12px", borderRadius: 10, background: "rgba(0,212,255,0.08)", border: "1px dashed rgba(0,212,255,0.4)", color: accent, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,255,0.12)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(0,212,255,0.08)"}
                    >
                      + Add New Lesson
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="tp-card" style={{ animation: "tp-fade-up 0.5s ease forwards", animationDelay: "200ms", opacity: 0, animationFillMode: "forwards" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.3rem", margin: "0 0 24px" }}>Student Reviews</h2>
                <div style={{ display: "flex", gap: 32, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>{avgRating}</p>
                    <div style={{ display: "flex", gap: 2, justifyContent: "center", marginBottom: 6 }}>
                      {[...Array(5)].map((_, i) => <span key={i} style={{ color: i < Math.round(avgRating) ? "#fbbf24" : "rgba(255,255,255,0.1)", fontSize: "0.95rem" }}>★</span>)}
                    </div>
                    <p style={{ color: muted, fontSize: "0.82rem" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
                    {ratingDist.map(rd => (
                      <div key={rd.star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: muted, fontSize: "0.82rem", width: 12 }}>{rd.star}</span>
                        <span style={{ color: "#fbbf24", fontSize: "0.8rem" }}>★</span>
                        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "#fbbf24", borderRadius: 100, width: `${rd.pct}%`, transition: "width 0.5s ease" }} />
                        </div>
                        <span style={{ color: muted, fontSize: "0.76rem", width: 16, textAlign: "right" }}>{rd.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {reviews.map(review => (
                    <div key={review._id} style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", transition: "border-color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #0094ff)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#001820", fontSize: "0.65rem", fontWeight: 800, flexShrink: 0 }}>{review.userId?.username?.charAt(0)?.toUpperCase() || "?"}</div>
                          <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>{review.userId?.username || "User"}</span>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>{[...Array(5)].map((_, i) => <span key={i} style={{ color: i < review.rating ? "#fbbf24" : "rgba(255,255,255,0.1)", fontSize: "0.75rem" }}>★</span>)}</div>
                      </div>
                      {review.comment && <p style={{ color: muted, fontSize: "0.88rem", margin: 0, lineHeight: 1.6 }}>{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 80 }}>
            <div className="tp-card" style={{ padding: 0, overflow: "hidden", boxShadow: "0 16px 60px rgba(0,0,0,0.4), 0 0 30px rgba(0,212,255,0.04)", animation: "tp-fade-up 0.5s ease forwards" }}>
              {course.thumbnail && <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />}
              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: 6 }}>
                  <span className="tp-gradient-text" style={{ fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.03em" }}>₹{course.price}</span>
                </div>
                <p style={{ color: muted, fontSize: "0.85rem", margin: "0 0 24px" }}>One-time payment • Lifetime access</p>

                {isEnrolled ? (
                  <button onClick={() => navigate("/my-courses")} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "linear-gradient(135deg, #34d399, #059669)", border: "none", color: "#001820", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 24px rgba(52,211,153,0.3)", transition: "all 0.3s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 36px rgba(52,211,153,0.45)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(52,211,153,0.3)"; }}
                  >✓ Go to My Courses</button>
                ) : (
                  <button onClick={handlePayment} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #0094ff)`, border: "none", color: "#001820", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 24px rgba(0,212,255,0.3)`, transition: "all 0.3s", opacity: loading ? 0.6 : 1, position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 36px rgba(0,212,255,0.45)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,212,255,0.3)"; }}
                  >
                    {loading ? (
                      <><span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,24,32,0.3)", borderTopColor: "#001820", animation: "tp-spin 0.8s linear infinite", display: "inline-block" }} /> Processing...</>
                    ) : (<>Enroll & Pay <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>)}
                  </button>
                )}

                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { icon: "📖", text: `${course.lessons?.length || 0} lessons` },
                    { icon: "📊", text: `${course.level} level` },
                    { icon: "🎓", text: "Certificate of completion" },
                    { icon: "♻️", text: "Lifetime access" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", color: muted }}>
                      <span>{item.icon}</span>
                      <span style={{ textTransform: "capitalize" }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delete Entire Course Button (Only for Admins/Tutors) */}
            {canEdit && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  onClick={handleDeleteCourse}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 12,
                    background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.2)",
                    color: "#f87171", fontWeight: 700, fontSize: "0.95rem",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(248,113,113,0.15)";
                    e.currentTarget.style.border = "1px solid rgba(248,113,113,0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(248,113,113,0.05)";
                    e.currentTarget.style.border = "1px solid rgba(248,113,113,0.2)";
                  }}
                >
                  Delete Entire Course
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Lesson Modal */}
      {
        showAddLesson && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,4,10,0.85)", backdropFilter: "blur(8px)", animation: "tp-fade-up 0.3s ease", zIndex: -1 }} onClick={() => setShowAddLesson(false)} />
            <div style={{ background: "rgba(6,14,24,0.95)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 500, position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.08)", animation: "tp-fade-up 0.4s ease forwards" }}>
              <button onClick={() => setShowAddLesson(false)} style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: muted, fontSize: "1.5rem", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = muted}>×</button>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.8rem", margin: "0 0 24px", color: text }}>Add New Lesson</h3>
              <form onSubmit={handleAddLesson} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: muted, marginBottom: 8 }}>Lesson Title *</label>
                  <input type="text" autoFocus required value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} placeholder="e.g. Introduction to React" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: text, fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: muted, marginBottom: 8 }}>Duration (Optional)</label>
                  <input type="text" value={newLessonDuration} onChange={e => setNewLessonDuration(e.target.value)} placeholder="e.g. 15 min" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: text, fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: muted, marginBottom: 8 }}>Video File *</label>
                  <div style={{ position: "relative", width: "100%", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px dashed rgba(0,212,255,0.3)", padding: 20, textAlign: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.2)"}>
                    <input type="file" required accept="video/*" onChange={e => setNewLessonVideo(e.target.files[0])} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                    {newLessonVideo ? (
                      <div style={{ color: accent, fontWeight: 600, fontSize: "0.9rem" }}>📹 {newLessonVideo.name}</div>
                    ) : (
                      <div style={{ color: muted, fontSize: "0.9rem" }}>Click to select a video file</div>
                    )}
                  </div>
                </div>
                <button disabled={uploadingVideo} type="submit" style={{ width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #0094ff)`, border: "none", color: "#001820", fontWeight: 800, fontSize: "1rem", cursor: uploadingVideo ? "not-allowed" : "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16, opacity: uploadingVideo ? 0.7 : 1 }}>
                  {uploadingVideo ? (
                    <><span style={{ width: 16, height: 16, border: "2px solid rgba(0,24,32,0.3)", borderTopColor: "#001820", borderRadius: "50%", animation: "tp-spin 0.6s linear infinite" }} /> Uploading Video...</>
                  ) : "Upload & Save Lesson"}
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default CourseDetails;
