
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    createReservation,
    getMyReservations
} = require("../controllers/reservations.controller");

// Reserve a book
router.post("/", verifyToken, createReservation);

// View my reservations
router.get("/my", verifyToken, getMyReservations);

module.exports = router;
