
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const verifyToken = require("../middleware/auth.middleware");

// Only admins can manage fines
const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};


 // ======================================
 // GET FINES FOR LOGGED-IN STUDENT
 // ======================================
router.get("/my", verifyToken, async (req, res) => {
    try {
        const [fines] = await db.query(`
            SELECT
                f.fine_id,
                f.issue_id,
                f.amount,
                f.status,
                f.created_at,
                b.title AS book_title,
                ib.due_date,
                ib.return_date
            FROM fines f
            JOIN issued_books ib ON f.issue_id = ib.issue_id
            JOIN books b ON ib.book_id = b.book_id
            WHERE ib.user_id = ?
            ORDER BY f.created_at DESC
        `, [req.user.user_id]);

        res.status(200).json({
            success: true,
            count: fines.length,
            fines
        });

    } catch (error) {
        console.error("Fetch student fines error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your fines"
        });
    }
});


// ======================================
// 1. GET ALL FINES
// ======================================
router.get("/", verifyToken, requireAdmin, async (req, res) => {
    try {
        const [fines] = await db.query(`
            SELECT
                f.fine_id,
                f.issue_id,
                f.amount,
                f.status,
                f.created_at,
                u.name AS student_name,
                b.title AS book_title,
                ib.due_date,
                ib.return_date
            FROM fines f
            JOIN issued_books ib ON f.issue_id = ib.issue_id
            JOIN users u ON ib.user_id = u.user_id
            JOIN books b ON ib.book_id = b.book_id
            ORDER BY f.created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: fines.length,
            fines: fines
        });

    } catch (error) {
        console.error("Get fines error:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching fines"
        });
    }
});

// ======================================
// 2. MARK FINE AS PAID
// ======================================
router.put("/:id/pay", verifyToken, requireAdmin, async (req, res) => {
    try {
        const fineId = req.params.id;

        const [result] = await db.query(
            "UPDATE fines SET status = 'paid' WHERE fine_id = ? AND status = 'unpaid'",
            [fineId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Unpaid fine not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Fine marked as paid successfully"
        });

    } catch (error) {
        console.error("Mark fine paid error:", error);

        res.status(500).json({
            success: false,
            message: "Error updating fine status"
        });
    }
});

module.exports = router;
