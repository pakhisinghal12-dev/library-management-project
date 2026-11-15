
const db = require("../config/db");

// CREATE RESERVATION
const createReservation = async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user.user_id;

        if (!book_id) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required"
            });
        }

        const [books] = await db.query(
            "SELECT book_id FROM books WHERE book_id = ?",
            [book_id]
        );

        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const [result] = await db.query(
            `INSERT INTO reservations (user_id, book_id)
             VALUES (?, ?)`,
            [user_id, book_id]
        );

        res.status(201).json({
            success: true,
            message: "Book reserved successfully",
            reservation_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Reservation failed"
        });
    }
};


// GET MY RESERVATIONS
const getMyReservations = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [reservations] = await db.query(
            `SELECT r.reservation_id, r.reservation_date,
                    r.status, b.book_id, b.title, b.author
             FROM reservations r
             JOIN books b ON r.book_id = b.book_id
             WHERE r.user_id = ?
             ORDER BY r.reservation_date DESC`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            count: reservations.length,
            reservations
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error fetching reservations"
        });
    }
};


// ======================================
// GET ALL RESERVATIONS (ADMIN)
// ======================================
const getAllReservations = async (req, res) => {
    try {
        const [reservations] = await db.query(
            `SELECT
                r.reservation_id,
                r.user_id,
                r.book_id,
                r.reservation_date,
                r.status,
                u.name AS student_name,
                b.title AS book_title
             FROM reservations r
             JOIN users u ON r.user_id = u.user_id
             JOIN books b ON r.book_id = b.book_id
             ORDER BY r.reservation_date DESC`
        );

        res.status(200).json({
            success: true,
            count: reservations.length,
            reservations
        });

    } catch (error) {
        console.error("Get all reservations error:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching reservations"
        });
    }
};


// ======================================
// UPDATE RESERVATION STATUS (ADMIN)
// ======================================
const updateReservationStatus = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected"
            });
        }

        const [result] = await db.query(
            `UPDATE reservations
             SET status = ?
             WHERE reservation_id = ? AND status = 'pending'`,
            [status, reservationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Pending reservation not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Reservation ${status} successfully`
        });

    } catch (error) {
        console.error("Update reservation error:", error);

        res.status(500).json({
            success: false,
            message: "Error updating reservation"
        });
    }
};



module.exports = {
    createReservation,
    getMyReservations,
    getAllReservations,
    updateReservationStatus
};

