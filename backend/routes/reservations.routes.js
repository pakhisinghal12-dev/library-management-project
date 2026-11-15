
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    createReservation,
    getMyReservations,
    getAllReservations,
    updateReservationStatus
} = require("../controllers/reservations.controller");

// Only admins can manage all reservations
const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};

// ADMIN: View all reservations
router.get("/", verifyToken, requireAdmin, getAllReservations);

// ADMIN: Approve or reject reservation
router.put("/:id/status", verifyToken, requireAdmin, updateReservationStatus);

// STUDENT: Create reservation
router.post("/", verifyToken, createReservation);

// STUDENT: View own reservations
router.get("/my", verifyToken, getMyReservations);

module.exports = router;
