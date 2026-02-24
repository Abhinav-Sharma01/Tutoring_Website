import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/auth-context";
import api from "../api/axios";
import toast from "react-hot-toast";

const Settings = () => {
    const { user, setUser } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        about: "",
        avatar_url: ""
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                about: user.about || "",
                avatar_url: user.avatar_url || ""
            });
        }
    }, [user]);

    useEffect(() => {
        const s = document.createElement("style");
        s.id = "tp-settings-styles";
        s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');
    .tp-settings * { box-sizing: border-box; }
    @keyframes tp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    .tp-grid-bg { background-image: linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px); background-size: 52px 52px; }
    .tp-input { width: 100%; padding: 14px 18px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #e2f5f5; font-family: 'Cabinet Grotesk', sans-serif; font-size: 0.95rem; outline: none; transition: all 0.3s; }
    .tp-input:focus { border-color: rgba(0,212,255,0.4); background: rgba(0,212,255,0.03); box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
    .tp-label { display: block; margin-bottom: 8px; color: #9bbeca; font-size: 0.85rem; font-weight: 600; }
    .tp-avatar-wrapper { position: relative; width: 120px; height: 120px; border-radius: 50%; padding: 4px; background: linear-gradient(135deg, #00d4ff, #a78bfa); margin: 0 auto 32px; cursor: pointer; transition: transform 0.3s; }
    .tp-avatar-wrapper:hover { transform: scale(1.05); }
    .tp-avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: #060e18; display: flex; alignItems: center; justifyContent: center; overflow: hidden; position: relative; }
    .tp-avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; alignItems: center; justifyContent: center; opacity: 0; transition: opacity 0.3s; color: #fff; font-size: 0.75rem; font-weight: 700; }
    .tp-avatar-wrapper:hover .tp-avatar-overlay { opacity: 1; }
    `;
        document.head.appendChild(s);
        return () => { const el = document.getElementById("tp-settings-styles"); if (el) el.remove(); };
    }, []);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            toast.error("Please select a valid image file (JPG, PNG)");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading("Uploading Avatar securely to Cloudinary...");

        const uploadData = new FormData();
        uploadData.append("video", file); // We use the existing middleware which accepts the field 'video', but since Cloudinary accepts images too, we reuse the route.

        try {
            const res = await api.post("/upload/video", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const newAvatarUrl = res.data.videoUrl; // Actually an image URL
            setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));

            toast.success("Avatar uploaded! Click 'Save Changes' to apply.", { id: toastId });
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Avatar upload failed. Please try again.", { id: toastId });
        } finally {
            setIsUploading(false);
            e.target.value = ""; // reset input
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading("Saving profile changes...");

        try {
            const res = await api.put("/auth/update-profile", formData);
            // Backend returns the updated user inside res.data.user
            setUser(res.data.user);
            toast.success("Profile updated successfully!", { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save changes", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const bg = "#030912";
    const text = "#e2f5f5";
    const accent = "#00d4ff";

    // If initial load hasn't fired yet
    if (!user) return <div style={{ background: bg, minHeight: "100vh" }} />;

    const initial = formData.username ? formData.username.charAt(0).toUpperCase() : "?";

    return (
        <div className="tp-settings tp-grid-bg" style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, padding: "80px 20px" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", animation: "tp-fade-up 0.5s ease forwards" }}>

                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: 100, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: accent, fontSize: "0.8rem", fontWeight: 700, marginBottom: 16 }}>
                        ⚙️ Profile Settings
                    </div>
                    <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2.8rem", margin: "0" }}>Your Profile</h1>
                </div>

                <div style={{ background: "rgba(6,14,24,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "40px", backdropFilter: "blur(20px)", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" style={{ display: "none" }} />

                    <div className="tp-avatar-wrapper" onClick={handleAvatarClick}>
                        <div className="tp-avatar-inner">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{ fontSize: "3rem", fontWeight: 800, color: "#fff" }}>{initial}</span>
                            )}
                            <div className="tp-avatar-overlay">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: 4 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                {isUploading ? "Uploading..." : "Upload Photo"}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "flex", gap: 20 }}>
                            <div style={{ flex: 1 }}>
                                <label className="tp-label">Username</label>
                                <input className="tp-input" name="username" value={formData.username} onChange={handleChange} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="tp-label">Email Address</label>
                                <input className="tp-input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>

                        <div>
                            <label className="tp-label">About Me (Optional)</label>
                            <textarea
                                className="tp-input"
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                placeholder="Tell students or tutors a bit about yourself..."
                                style={{ minHeight: 120, resize: "vertical" }}
                            />
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <button type="submit" disabled={isSaving || isUploading} style={{ width: "100%", padding: "16px", borderRadius: 14, background: `linear-gradient(135deg, ${accent}, #0094ff)`, color: "#001820", fontSize: "1rem", fontWeight: 800, border: "none", cursor: (isSaving || isUploading) ? "not-allowed" : "pointer", opacity: (isSaving || isUploading) ? 0.7 : 1, transition: "transform 0.2s, boxShadow 0.2s", boxShadow: "0 8px 32px rgba(0,212,255,0.25)" }}
                                onMouseEnter={e => { if (!isSaving && !isUploading) e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { if (!isSaving && !isUploading) e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                {isSaving ? "Saving Everything..." : "Save Profile Changes"}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Settings;
