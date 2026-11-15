
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const booksRoutes = require("./routes/books.routes");
const authRoutes = require("./routes/auth.routes");
const studentsRoutes = require("./routes/students.routes");
const borrowRoutes = require("./routes/borrow.routes");
const reservationsRoutes = require("./routes/reservations.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const finesRoutes = require("./routes/fines.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/books", booksRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/fines", finesRoutes);

// Test database connection
db.getConnection()
    .then(connection => {
        console.log("MySQL Connected Successfully!");
        connection.release();
    })
    .catch(error => {
        console.error("Database connection failed:", error.message);
    });

// Test route
app.get("/", (req, res) => {
    res.send("Library Management System Backend is Running!");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
