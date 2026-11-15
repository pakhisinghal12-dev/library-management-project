
const db = require("../config/db");

// ADD BOOK TO WISHLIST
const addToWishlist = async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user.user_id;

        if (!book_id) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO wishlist (user_id, book_id)
             VALUES (?, ?)`,
            [user_id, book_id]
        );

        res.status(201).json({
            success: true,
            message: "Book added to wishlist",
            wishlist_id: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Book already exists in wishlist"
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not add book to wishlist"
        });
    }
};


// GET MY WISHLIST
const getMyWishlist = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [wishlist] = await db.query(
            `SELECT w.wishlist_id, w.added_at,
                    b.book_id, b.title, b.author, b.available_copies
             FROM wishlist w
             JOIN books b ON w.book_id = b.book_id
             WHERE w.user_id = ?
             ORDER BY w.added_at DESC`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error fetching wishlist"
        });
    }
};


// REMOVE FROM WISHLIST
const removeFromWishlist = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { id } = req.params;

        const [result] = await db.query(
            `DELETE FROM wishlist
             WHERE wishlist_id = ? AND user_id = ?`,
            [id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Wishlist item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Book removed from wishlist"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not remove wishlist item"
        });
    }
};

module.exports = {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist
};
