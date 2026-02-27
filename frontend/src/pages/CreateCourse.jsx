import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";
import toast from "react-hot-toast";

const categories = ["web development", "frontend", "backend", "data science", "design", "mobile", "devops", "other"];
const levels = ["beginner", "intermediate", "advanced"];

const CreateCourse = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "", description: "", price: "", category: "web development", level: "beginner", thumbnail: "",
    });
    const [lessons, setLessons] = useState([{ title: "", duration: "", videoUrl: "" }]);
    const [uploading, setUploading] = useState(null);

    useEffect(() => {
        if (user && user.role !== "tutor" && user.role !== "admin") {
            toast.error("Only tutors and admins can create courses");
            navigate("/dashboard");
        }
    }, [user, navigate]);

    useEffect(() => {
        const style = document.createElement("style");
        style.id = "tp-create-course-styles";
        style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
      .tp-cc * { box-sizing: border-box; }
      @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes tp-glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      .tp-cc-input {
        width: 100%; padding: 14px 16px;
        background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px;
        color: #e2f5f5; font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.95rem; outline: none; transition: all 0.3s ease;
      }
      .tp-cc-input::placeholder { color: rgba(107,143,160,0.55); }
      .tp-cc-input:focus {
        border-color: rgba(0,212,255,0.45);
        background: rgba(0,212,255,0.04);
        box-shadow: 0 0 0 4px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.06);
      }
      .tp-cc-textarea { min-height: 120px; resize: vertical; }
      .tp-cc-select {
        width: 100%; padding: 14px 16px; appearance: none;
        background: rgba(255,255,255,0.03) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b8fa0' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 01.753 1.659l-4.796 5.48a1 1 0 01-1.506 0z'/%3E%3C/svg%3E") no-repeat right 16px center;
        border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px;
        color: #e2f5f5; font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.95rem; outline: none; transition: all 0.3s ease; cursor: pointer;
      }
      .tp-cc-select:focus { border-color: rgba(0,212,255,0.45); }
      .tp-cc-select option { background: #0a1628; color: #e2f5f5; }
      .tp-grid-bg {
        background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px);
        background-size: 52px 52px;
      }
    `;
        document.head.appendChild(style);
        return () => { const el = document.getElementById("tp-create-course-styles"); if (el) el.remove(); };
    }, []);

    const bg = "#030912";
    const text = "#e2f5f5";
    const muted = "#6b8fa0";
    const accent = "#00d4ff";

    const addLesson = () => setLessons([...lessons, { title: "", duration: "", videoUrl: "" }]);

    const removeLesson = (i) => {
        if (lessons.length === 1) return;
        setLessons(lessons.filter((_, idx) => idx !== i));
    };

    const updateLesson = (i, field, value) => {
        const updated = [...lessons];
        updated[i][field] = value;
        setLessons(updated);
    };

    const handleVideoUpload = async (index, file) => {
        if (!file) return;
        setUploading(index);

        try {
            const { data } = await api.get("/upload/signature?folder=tutoring/videos");
            const { signature, timestamp, folder, cloudName, apiKey } = data;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            formData.append("folder", folder);

            const uploadRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const cloudinaryData = await uploadRes.json();

            if (!uploadRes.ok) {
                throw new Error(cloudinaryData.error?.message || "Cloudinary upload failed");
            }

            updateLesson(index, "videoUrl", cloudinaryData.secure_url);
            toast.success("Video uploaded successfully!");
        } catch (err) {
            console.error("Direct upload error:", err);
            toast.error(err.message || "Failed to upload video");
        } finally {
            setUploading(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.price || !form.category || !form.level) {
            toast.error("Please fill in all required fields");
            return;
        }
        const validLessons = lessons.filter(l => l.title && l.duration);
        if (validLessons.length === 0) {
            toast.error("Add at least one lesson with title and duration");
            return;
        }
        setLoading(true);
        try {
            await api.post("/courses/create", {
                title: form.title,
                description: form.description,
                price: Number(form.price),
                category: form.category,
                level: form.level,
                thumbnail: form.thumbnail,
                lessons: validLessons,
            });
            toast.success("Course created successfully!");
            navigate("/instructor");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create course");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tp-cc tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, padding: "32px 24px 80px" }}>
            <div style={{ position: "absolute", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)", top: 80, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", animation: "tp-glow-pulse 8s ease-in-out infinite" }} />

            <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
                <div style={{ textAlign: "center", marginBottom: 48, animation: "tp-fade-up 0.6s ease forwards" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 100, background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", marginBottom: 20, fontSize: "0.8rem", color: accent, fontWeight: 600 }}>
                        ✦ Instructor Studio
                    </div>
                    <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 5vw, 3rem)", margin: "0 0 12px", letterSpacing: "-0.01em" }}>Create a New Course</h1>
                    <p style={{ color: muted, maxWidth: 500, margin: "0 auto", fontSize: "1rem" }}>
                        Build engaging content for your students. Add lessons, set pricing, and publish.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "36px 32px", marginBottom: 28, backdropFilter: "blur(12px)", animation: "tp-fade-up 0.6s ease forwards", animationDelay: "0.1s" }}>
                        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.4rem", margin: "0 0 28px", display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "1.2rem" }}>📘</span> Course Details
                        </h2>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Course Title *</label>
                            <input className="tp-cc-input" placeholder="e.g. Complete React Masterclass" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Description *</label>
                            <textarea className="tp-cc-input tp-cc-textarea" placeholder="What will students learn? Describe your course..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Price (₹) *</label>
                                <input className="tp-cc-input" type="number" min="0" placeholder="499" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Category *</label>
                                <select className="tp-cc-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Level *</label>
                                <select className="tp-cc-select" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                                    {levels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Thumbnail URL (optional)</label>
                            <input className="tp-cc-input" placeholder="https://example.com/thumbnail.jpg" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ background: "rgba(6,14,24,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "36px 32px", marginBottom: 28, backdropFilter: "blur(12px)", animation: "tp-fade-up 0.6s ease forwards", animationDelay: "0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.4rem", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: "1.2rem" }}>🎬</span> Lessons ({lessons.length})
                            </h2>
                            <button type="button" onClick={addLesson} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: accent, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.3s" }}>
                                + Add Lesson
                            </button>
                        </div>

                        {lessons.map((lesson, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px 20px 16px", marginBottom: 16, position: "relative", animation: "tp-fade-up 0.3s ease forwards" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: accent, letterSpacing: "0.04em" }}>LESSON {i + 1}</span>
                                    {lessons.length > 1 && (
                                        <button type="button" onClick={() => removeLesson(i)} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "4px 12px", color: "#f87171", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 10 }}>
                                    <input className="tp-cc-input" placeholder="Lesson title *" value={lesson.title} onChange={e => updateLesson(i, "title", e.target.value)} />
                                    <input className="tp-cc-input" placeholder="Duration (e.g. 45 min) *" value={lesson.duration} onChange={e => updateLesson(i, "duration", e.target.value)} />
                                </div>

                                <label style={{ display: "block", fontSize: "0.80rem", fontWeight: 700, color: muted, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Video Content</label>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <input className="tp-cc-input" style={{ flex: 1 }} placeholder="Paste video URL or upload file →" value={lesson.videoUrl} onChange={e => updateLesson(i, "videoUrl", e.target.value)} />
                                    <div style={{ position: "relative" }}>
                                        <button type="button" disabled={uploading === i} style={{ padding: "12px 18px", background: "rgba(0,212,255,0.08)", border: "1px dashed rgba(0,212,255,0.4)", borderRadius: 10, color: accent, fontSize: "0.85rem", fontWeight: 700, cursor: uploading === i ? "not-allowed" : "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                                            {uploading === i ? (
                                                <><span style={{ width: 14, height: 14, border: "2px solid rgba(0,212,255,0.3)", borderTopColor: accent, borderRadius: "50%", display: "inline-block", animation: "tp-spin 0.6s linear infinite" }} /> Uploading...</>
                                            ) : (
                                                <>📥 Upload Video</>
                                            )}
                                        </button>
                                        <input
                                            type="file"
                                            accept="video/mp4,video/webm"
                                            disabled={uploading === i}
                                            onChange={e => handleVideoUpload(i, e.target.files[0])}
                                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ animation: "tp-fade-up 0.6s ease forwards", animationDelay: "0.3s" }}>
                        <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px 32px", background: loading ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg, #00d4ff, #0094ff)", border: "none", borderRadius: 14, color: "#fff", fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "1.05rem", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s ease", boxShadow: loading ? "none" : "0 4px 30px rgba(0,212,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            {loading ? (
                                <><span style={{ width: 20, height: 20, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "tp-spin 0.6s linear infinite" }} /> Creating Course...</>
                            ) : (
                                <>🚀 Publish Course</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse;
