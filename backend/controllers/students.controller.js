
const db = require("../config/db");

// GET ALL STUDENTS
const getAllStudents = async (req, res) => {
    try {
        const [students] = await db.query(
            `SELECT user_id, name, email, role, created_at
             FROM users
             WHERE role = 'student'`
        );

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching students"
        });
    }
};

// GET STUDENT BY ID
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const [students] = await db.query(
            `SELECT user_id, name, email, role, created_at
             FROM users
             WHERE user_id = ? AND role = 'student'`,
            [id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            student: students[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching student"
        });
    }
};

// UPDATE STUDENT
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        const [result] = await db.query(
            `UPDATE users
             SET name = ?, email = ?
             WHERE user_id = ? AND role = 'student'`,
            [name, email, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Student updated successfully"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error updating student"
        });
    }
};

// DELETE STUDENT
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM users WHERE user_id = ? AND role = 'student'",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(409).json({
            success: false,
            message: "Cannot delete this student. They may have related library records."
        });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};
