import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const ContactUs = () => {
    const [loading, setLoading] = useState(false);

    const bg = "#030912";
    const text = "#e2f5f5";
    const muted = "#6b8fa0";
    const accent = "#00d4ff";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            await api.post("/auth/contact", data);
            toast.success("Message sent successfully! Our team will get back to you soon.");
            e.target.reset();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, padding: "80px 32px 100px" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(300px, 1fr) minmax(300px, 1.2fr)", gap: 64, alignItems: "start", animation: "tp-fade-up 0.5s ease" }}>

                {/* Left Info */}
                <div>
                    <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", margin: "0 0 16px", lineHeight: 1 }}>Get in touch</h1>
                    <p style={{ color: muted, fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 48 }}>
                        Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px", color: text, display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: accent }}>✉️</span> Chat with us
                            </h3>
                            <p style={{ color: muted, margin: "0 0 4px", fontSize: "0.95rem" }}>Our friendly team is here to help.</p>
                            <a href="mailto:support@tutorpro.com" style={{ color: accent, fontWeight: 600, textDecoration: "none" }}>support@tutorpro.com</a>
                        </div>

                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px", color: text, display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: accent }}>🏢</span> Office
                            </h3>
                            <p style={{ color: muted, margin: "0 0 4px", fontSize: "0.95rem" }}>Come say hello at our HQ.</p>
                            <p style={{ color: "#e2f5f5", margin: 0, fontWeight: 500 }}>100 Learning Avenue<br />Tech District, SF 94107</p>
                        </div>

                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px", color: text, display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: accent }}>📞</span> Phone
                            </h3>
                            <p style={{ color: muted, margin: "0 0 4px", fontSize: "0.95rem" }}>Mon-Fri from 8am to 5pm.</p>
                            <p style={{ color: "#e2f5f5", margin: 0, fontWeight: 500 }}>+1 (555) 000-0000</p>
                        </div>
                    </div>
                </div>

                {/* Right Form */}
                <div style={{ background: "rgba(6,14,24,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "40px", backdropFilter: "blur(20px)" }}>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: muted, marginBottom: 8 }}>First name</label>
                                <input type="text" name="firstName" required placeholder="First name" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: text, fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: muted, marginBottom: 8 }}>Last name</label>
                                <input type="text" name="lastName" required placeholder="Last name" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: text, fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: muted, marginBottom: 8 }}>Email</label>
                            <input type="email" name="email" required placeholder="you@company.com" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: text, fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: muted, marginBottom: 8 }}>Message</label>
                            <textarea required name="message" rows="4" placeholder="How can we help?" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: text, fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s", resize: "vertical" }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                        </div>

                        <button disabled={loading} type="submit" style={{ width: "100%", padding: "16px", borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #0094ff)`, border: "none", color: "#001820", fontWeight: 800, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, opacity: loading ? 0.7 : 1, transition: "transform 0.2s", boxShadow: "0 4px 20px rgba(0,212,255,0.3)" }} onMouseEnter={e => { if (!loading) e.target.style.transform = "translateY(-2px)" }} onMouseLeave={e => { if (!loading) e.target.style.transform = "translateY(0)" }}>
                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ContactUs;
