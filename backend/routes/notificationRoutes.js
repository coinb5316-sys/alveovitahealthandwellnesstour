// routes/notificationRoutes.js - ADD THIS ROUTE
import express from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationCount,
  getNotificationStats,
  sendTestNotification,
  getNotificationTypes  // ← ADD THIS
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// ================= GET NOTIFICATION TYPES =================
router.get("/types", getNotificationTypes);  // ← ADD THIS

// ================= GET NOTIFICATIONS =================
router.get("/", getUserNotifications);

// ================= GET UNREAD COUNT =================
router.get("/count", getNotificationCount);

// ================= GET NOTIFICATION STATS (Admin only) =================
router.get("/stats", getNotificationStats);

// ================= MARK AS READ =================
router.put("/:id/read", markAsRead);

// ================= MARK ALL AS READ =================
router.put("/read-all", markAllAsRead);

// ================= DELETE NOTIFICATION =================
router.delete("/:id", deleteNotification);

// ================= DELETE ALL NOTIFICATIONS =================
router.delete("/delete-all", deleteAllNotifications);

// ================= TEST NOTIFICATION (Development only) =================
if (process.env.NODE_ENV === "development") {
  router.post("/test", sendTestNotification);
}

export default router;