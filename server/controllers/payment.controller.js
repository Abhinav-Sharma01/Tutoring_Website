import crypto from "crypto";
import { razorpayInstance } from "../utils/razorpay.js";
import { Enrollment } from "../models/Enrollment.model.js";

const createOrder = async (req, res) => {
    try {
        const { amount, courseId } = req.body;
        const studentId = req.user.id;

        if (!amount || !courseId) {
            return res.status(400).json({ message: "Amount and courseId are required" });
        }

        // amount in paise
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);

        // upsert to avoid duplicate enrollments
        const enrollment = await Enrollment.findOneAndUpdate(
            { studentId, courseId },
            { $setOnInsert: { studentId, courseId, paymentStatus: "pending" } },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            success: true,
            order,
            enrollmentId: enrollment._id
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Could not create Razorpay order" });
    }
};


const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            enrollmentId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !enrollmentId) {
            return res.status(400).json({ message: "Missing payment verification fields" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // mark payment as successful
        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        enrollment.paymentStatus = "success";
        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: "Payment Verified Successfully"
        });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: "Payment verification failed" });
    }
};


export {
    createOrder,
    verifyPayment
}
