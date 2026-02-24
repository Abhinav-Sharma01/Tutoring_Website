import { Notification } from "../models/Notification.model.js";

// Fetch all notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // limit to most recent 50

        res.status(200).json({ notifications });
    } catch (error) {
        console.error("Fetch notifications error:", error.message);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
};

// Clear all user notifications (Dismiss All)
export const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.status(200).json({ message: "All notifications cleared." });
    } catch (error) {
        console.error("Clear all notifications error:", error.message);
        res.status(500).json({ message: "Failed to clear notifications." });
    }
};

// Delete a single notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }

        res.status(200).json({ message: "Notification deleted." });
    } catch (error) {
        console.error("Delete notification error:", error.message);
        res.status(500).json({ message: "Failed to delete notification." });
    }
};
