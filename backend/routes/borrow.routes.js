
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    issueBook,
    returnBook,
    getAllIssues
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

// Get all issue records
router.get("/", verifyToken, requireAdmin, getAllIssues);

// Issue a book
router.post("/issue", verifyToken, requireAdmin, issueBook);

// Return a book
router.put("/return/:id", verifyToken, requireAdmin, returnBook);

module.exports = router;
