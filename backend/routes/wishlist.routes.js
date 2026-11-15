
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist
} = require("../controllers/wishlist.controller");

// Add book to wishlist
router.post("/", verifyToken, addToWishlist);

// View my wishlist
router.get("/my", verifyToken, getMyWishlist);

// Remove book from wishlist
router.delete("/:id", verifyToken, removeFromWishlist);

module.exports = router;
