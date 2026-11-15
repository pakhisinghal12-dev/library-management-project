
const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ======================================
// 1. GET ALL BOOKS
// ======================================
router.get("/", async (req, res) => {
    try {
        const [books] = await db.query("SELECT * FROM books");

        res.status(200).json({
            success: true,
            count: books.length,
            books: books
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error fetching books"
        });
    }
});


// ======================================
// 2. SEARCH BOOKS BY TITLE OR AUTHOR
// ======================================
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Please enter a search term"
            });
        }

        const searchTerm = `%${q}%`;

        const [books] = await db.query(
            "SELECT * FROM books WHERE title LIKE ? OR author LIKE ?",
            [searchTerm, searchTerm]
        );

        res.status(200).json({
            success: true,
            count: books.length,
            books: books
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error searching books"
        });
    }
});


// ======================================
// 3. GET SINGLE BOOK BY ID
// ======================================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [books] = await db.query(
            "SELECT * FROM books WHERE book_id = ?",
            [id]
        );

        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.status(200).json({
            success: true,
            book: books[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error fetching book"
        });
    }
});


 // ======================================
 // 4. ADD A NEW BOOK
 // ======================================
router.post("/", async (req, res) => {
    try {
        const {
            title,
            author,
            isbn,
            category_id,
            total_copies,
            available_copies
        } = req.body;

        if (!title || !author) {
            return res.status(400).json({
                success: false,
                message: "Title and author are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO books
            (title, author, isbn, category_id, total_copies, available_copies)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title,
                author,
                isbn || null,
                category_id || null,
                total_copies ?? 1,
                available_copies ?? total_copies ?? 1
            ]
        );

        res.status(201).json({
            success: true,
            message: "Book added successfully",
            book_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error adding book"
        });
    }
});


// ======================================
// 5. UPDATE AN EXISTING BOOK
// ======================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            author,
            isbn,
            category_id,
            total_copies,
            available_copies
        } = req.body;

        if (
            !title ||
            !author ||
            total_copies === undefined ||
            available_copies === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, author, total_copies and available_copies"
            });
        }

        const [result] = await db.query(
            `UPDATE books
             SET title = ?,
                 author = ?,
                 isbn = ?,
                 category_id = ?,
                 total_copies = ?,
                 available_copies = ?
             WHERE book_id = ?`,
            [
                title,
                author,
                isbn || null,
                category_id || null,
                total_copies,
                available_copies,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Book updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error updating book"
        });
    }
});


// ======================================
// 6. DELETE A BOOK
// ======================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM books WHERE book_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this book because it is referenced by another library record"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error deleting book"
        });
    }
});


// EXPORT ROUTER
module.exports = router;
