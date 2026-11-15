
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} = require("../controllers/students.controller");

// Only admins can manage student records
const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};

// Student management routes
router.get("/", verifyToken, requireAdmin, getAllStudents);
router.get("/:id", verifyToken, requireAdmin, getStudentById);
router.put("/:id", verifyToken, requireAdmin, updateStudent);
router.delete("/:id", verifyToken, requireAdmin, deleteStudent);

module.exports = router;
