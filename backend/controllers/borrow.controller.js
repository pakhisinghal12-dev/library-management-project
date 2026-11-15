
const db = require("../config/db");

// ======================================
// 1. ISSUE A BOOK
// ======================================
const issueBook = async (req, res) => {
    let connection;

    try {
        const { user_id, book_id } = req.body;

        // Loan period: 14 days
        if (!user_id || !book_id) {
            return res.status(400).json({
                success: false,
                message: "User ID and Book ID are required"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check student
        const [students] = await connection.query(
            "SELECT user_id FROM users WHERE user_id = ? AND role = 'student'",
            [user_id]
        );

        if (students.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Check book availability
        const [books] = await connection.query(
            "SELECT book_id, available_copies FROM books WHERE book_id = ? FOR UPDATE",
            [book_id]
        );

        if (books.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (books[0].available_copies <= 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Book is not available"
            });
        }

        // Calculate due date automatically: 14 days
        const [result] = await connection.query(
            `INSERT INTO issued_books
             (user_id, book_id, issue_date, due_date, status)
             VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'issued')`,
            [user_id, book_id]
        );

        // Reduce available copies
        await connection.query(
            `UPDATE books
             SET available_copies = available_copies - 1
             WHERE book_id = ?`,
            [book_id]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Book issued successfully",
            issue_id: result.insertId,
            loan_period_days: 14
        });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Issue book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to issue book"
        });

    } finally {
        if (connection) connection.release();
    }
};


// ======================================
// 2. RETURN A BOOK + CALCULATE FINE
// ======================================
const returnBook = async (req, res) => {
    let connection;

    try {
        const { id } = req.params;
        const FINE_PER_DAY = 5;

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [issues] = await connection.query(
            `SELECT issue_id, book_id, due_date, status,
                    DATEDIFF(CURDATE(), due_date) AS overdue_days
             FROM issued_books
             WHERE issue_id = ?
             FOR UPDATE`,
            [id]
        );

        if (issues.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Issue record not found"
            });
        }

        const issue = issues[0];

        if (issue.status !== "issued") {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "This book has already been returned"
            });
        }

        const overdueDays = Math.max(0, Number(issue.overdue_days));
        const fineAmount = overdueDays * FINE_PER_DAY;

        // Mark as returned
        await connection.query(
            `UPDATE issued_books
             SET status = 'returned',
                 return_date = CURDATE()
             WHERE issue_id = ?`,
            [id]
        );

        // Save fine if overdue
        if (fineAmount > 0) {
            await connection.query(
                `INSERT INTO fines (issue_id, amount, status)
                 VALUES (?, ?, 'unpaid')`,
                [id, fineAmount]
            );
        }

        // Restore available copies
        await connection.query(
            `UPDATE books
             SET available_copies =
                 LEAST(available_copies + 1, total_copies)
             WHERE book_id = ?`,
            [issue.book_id]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Book returned successfully",
            overdue_days: overdueDays,
            fine_amount: fineAmount,
            fine_status: fineAmount > 0 ? "unpaid" : "no fine"
        });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Return book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to return book"
        });

    } finally {
        if (connection) connection.release();
    }
};


// ======================================
// EXPORT BOTH FUNCTIONS
// ======================================
module.exports = {
    issueBook,
    returnBook
};
