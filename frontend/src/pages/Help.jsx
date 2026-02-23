import { useState } from "react";
import { Link } from "react-router-dom";

const Help = () => {
    const [openQ, setOpenQ] = useState(null);

    const bg = "#030912";
    const text = "#e2f5f5";
    const muted = "#6b8fa0";
    const accent = "#00d4ff";

    const faqs = [
        {
            q: "How do I enroll in a course?",
            a: "To enroll, simply log into your account, browse to the course you want to take, and click the 'Enroll & Pay' button on the course details page. Once payment is successful, you'll have lifetime access."
        },
        {
            q: "Are the courses actually lifetime access?",
            a: "Yes! Once you purchase a course on TutorPro, it is permanently added to your 'My Courses' dashboard and you can rewatch the lessons as many times as you like."
        },
        {
            q: "How do I become an Instructor?",
            a: "During registration, select the 'Tutor' role. If you already have a Student account, please contact our support team to upgrade your account to an Instructor so you can start creating courses."
        },
        {
            q: "I forgot my password, how do I recover it?",
            a: "Click on 'Log in' and then select the 'Forgot Password' link. Enter your registered email address and we will send you a 6-digit OTP code to verify your identity before letting you set a new password."
        },
        {
            q: "How do I get my certificate of completion?",
            a: "Once you have watched all the lessons in a course, go to 'My Courses', click 'Mark as Complete', and a 'Download Certificate' button will appear for that course."
        },
        {
            q: "What types of video formats can instructors upload?",
            a: "Instructors can directly upload any standard web video format (MP4, WebM) directly from the 'Create Course' page or the '+ Add New Lesson' modal on their existing courses."
        }
    ];

    return (
        <div style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, padding: "60px 32px 100px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", animation: "tp-fade-up 0.5s ease" }}>

                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2.5rem, 5vw, 3.5rem)", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                        How can we <span style={{ color: accent }}>help</span> you?
                    </h1>
                    <p style={{ color: muted, fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>Browse our frequently asked questions or contact our support team if you can't find the answer you're looking for.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {faqs.map((faq, i) => (
                        <div key={i} style={{ background: "rgba(6,14,24,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", transition: "all 0.3s" }}>
                            <button
                                onClick={() => setOpenQ(openQ === i ? null : i)}
                                style={{ width: "100%", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", color: text, fontSize: "1.05rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", textAlign: "left" }}
                            >
                                {faq.q}
                                <span style={{ color: accent, fontSize: "1.2rem", transform: openQ === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.3s" }}>+</span>
                            </button>

                            <div style={{ maxHeight: openQ === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.4s ease" }}>
                                <div style={{ padding: "0 24px 20px", color: muted, fontSize: "0.95rem", lineHeight: 1.6 }}>
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 64, textAlign: "center", padding: 40, background: "rgba(0,212,255,0.03)", borderRadius: 24, border: "1px solid rgba(0,212,255,0.1)" }}>
                    <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.8rem", margin: "0 0 12px" }}>Still need help?</h2>
                    <p style={{ color: muted, marginBottom: 24 }}>Our dedicated support team is ready to assist you.</p>
                    <Link to="/contact" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #0094ff)`, color: "#001820", textDecoration: "none", fontWeight: 800, fontSize: "0.95rem", boxShadow: "0 4px 20px rgba(0,212,255,0.3)", transition: "transform 0.2s" }} onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
                        Contact Support
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Help;
