import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: `"TutorPro" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Password Reset - TutorPro",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a1628; border-radius: 16px; color: #e2f5f5;">
                <h2 style="color: #00d4ff; margin-bottom: 8px;">Password Reset</h2>
                <p style="color: #8ab0bf; margin-bottom: 24px;">Use this code to reset your TutorPro password. It expires in 10 minutes.</p>
                <div style="background: #111d2e; border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #00d4ff;">${otp}</span>
                </div>
                <p style="color: #6b8fa0; font-size: 13px;">If you didn't request this, ignore this email.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};
