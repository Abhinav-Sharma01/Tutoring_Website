import { Link } from "react-router-dom";

const Footer = () => {
    const accent = "#00d4ff";
    const muted = "#6b8fa0";
    const bg = "#030912";
    const text = "#e2f5f5";

    return (
        <footer style={{ background: "rgba(3,9,18,0.95)", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "40px 32px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 32 }}>

                {/* Brand */}
                <div style={{ flex: "1 1 300px" }}>
                    <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, #0094ff)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#001820", fontWeight: 900, fontSize: "0.85rem" }}>T</span>
                        </div>
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.35rem", color: text }}>
                            Tutor<span style={{ color: accent }}>Pro</span>
                        </span>
                    </Link>
                    <p style={{ color: muted, fontSize: "0.85rem", lineHeight: 1.6, maxWidth: 300, margin: 0 }}>
                        Empowering millions of learners around the globe to achieve their goals. Learn from the best, anywhere, anytime.
                    </p>
                </div>

                {/* Links */}
                <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
                    <div>
                        <h4 style={{ color: text, fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>Platform</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                            <li><Link to="/courses" style={{ color: muted, textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = muted}>Browse Courses</Link></li>
                            <li><Link to="/register" style={{ color: muted, textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = muted}>Become an Instructor</Link></li>
                            <li><Link to="/login" style={{ color: muted, textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = muted}>Log In</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: text, fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>Support</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                            <li><Link to="/help" style={{ color: muted, textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = muted}>Help & FAQ</Link></li>
                            <li><Link to="/contact" style={{ color: muted, textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = muted}>Contact Us</Link></li>
                            <li><Link to="/about" style={{ color: muted, textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = muted}>About Us</Link></li>
                        </ul>
                    </div>
                </div>

            </div>

            <div style={{ maxWidth: 1200, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <p style={{ color: muted, fontSize: "0.8rem", margin: 0 }}>© {new Date().getFullYear()} TutorPro Inc. All rights reserved.</p>
                <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ color: muted, fontSize: "0.8rem", cursor: "pointer" }} onMouseEnter={e => e.target.style.color = text} onMouseLeave={e => e.target.style.color = muted}>Terms</span>
                    <span style={{ color: muted, fontSize: "0.8rem", cursor: "pointer" }} onMouseEnter={e => e.target.style.color = text} onMouseLeave={e => e.target.style.color = muted}>Privacy</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
