
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    issueBook,
    returnBook,
    getAllIssues,
    getMyIssues
} = require("../controllers/borrow.controller");

// Only admins can issue and return books
const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};

// Student: Get only their own issue records
router.get("/my", verifyToken, getMyIssues);

// Admin: Get all issue records
router.get("/", verifyToken, requireAdmin, getAllIssues);

// Admin: Issue a book
router.post("/issue", verifyToken, requireAdmin, issueBook);

// Admin: Return a book
router.put("/return/:id", verifyToken, requireAdmin, returnBook);

module.exports = router;
