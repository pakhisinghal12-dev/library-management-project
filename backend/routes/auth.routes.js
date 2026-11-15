
const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/auth.controller");

// Registration API
router.post("/register", register);

// Login API
router.post("/login", login);

module.exports = router;
