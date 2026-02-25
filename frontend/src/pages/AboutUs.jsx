import { Link } from "react-router-dom";

const AboutUs = () => {
    const bg = "#030912";
    const text = "#e2f5f5";
    const muted = "#6b8fa0";
    const accent = "#00d4ff";

    return (
        <div style={{ background: bg, minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", color: text, padding: "0 0 100px", overflow: "hidden" }}>

            <div style={{ position: "relative", padding: "100px 32px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "linear-gradient(180deg, rgba(0,212,255,0.03) 0%, transparent 100%)" }}>
                <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", animation: "tp-fade-up 0.5s ease" }}>
                    <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(3rem, 6vw, 4.5rem)", margin: "0 0 20px", lineHeight: 1 }}>
                        Empowering the world to <span style={{ color: accent }}>learn</span> and <span style={{ color: "#a78bfa" }}>teach</span>.
                    </h1>
                    <p style={{ color: muted, fontSize: "1.15rem", lineHeight: 1.6, maxWidth: 640, margin: "0 auto 32px" }}>
                        TutorPro is a premium online learning ecosystem designed to connect ambitious students with expert instructors across the globe.
                    </p>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                        <Link to="/courses" style={{ padding: "12px 28px", borderRadius: 100, background: `linear-gradient(135deg, ${accent}, #0094ff)`, color: "#001820", textDecoration: "none", fontWeight: 800, fontSize: "0.95rem" }}>Explore Courses</Link>
                        <Link to="/register" style={{ padding: "12px 28px", borderRadius: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: text, textDecoration: "none", fontWeight: 700, fontSize: "0.95rem" }}>Become an Instructor</Link>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: "-40px auto 60px", padding: "0 32px", position: "relative", zIndex: 10, animation: "tp-fade-up 0.7s ease" }}>
                <div style={{ background: "rgba(6,14,24,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "32px 48px", backdropFilter: "blur(20px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                    {[
                        { label: "Active Learners", value: "2M+" },
                        { label: "Expert Instructors", value: "15k+" },
                        { label: "Premium Courses", value: "35k+" },
                        { label: "Countries Reached", value: "190+" }
                    ].map((stat, i) => (
                        <div key={i}>
                            <div style={{ fontSize: "2.5rem", fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: text, marginBottom: 4 }}>{stat.value}</div>
                            <div style={{ color: accent, fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2.2rem", margin: "0 0 24px" }}>Our Mission</h2>
                <div style={{ color: muted, fontSize: "1.05rem", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 20 }}>
                    <p>
                        Founded in 2024, TutorPro was built on a simple conviction: high-quality education should be accessible, visually stunning, and technologically seamless. We noticed that traditional e-learning platforms felt clunky, outdated, and uninspiring.
                    </p>
                    <p>
                        We set out to build a platform that feels like magic. From our robust Cloudinary-powered video infrastructure to our seamless Razorpay integrations, every pixel of TutorPro is engineered to get out of the way so that students can focus on what matters: <strong>learning.</strong>
                    </p>
                    <p>
                        Today, TutorPro serves thousands of instructors who use our custom dashboards to monitor their revenue, manage their content, and interact with an ever-growing global student base.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default AboutUs;
