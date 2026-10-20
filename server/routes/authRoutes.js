var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var { ObjectId } = require("mongodb");
var { getUserCollection } = require("../models/User");
var authMiddleware = require("../middleware/authMiddleware");

var router = express.Router();

// REGISTER
router.post("/register", async function (req, res) {
    try {
        var {
            name,
            username,
            email,
            password,
            confirmPassword
        } = req.body;

        if (
            !name ||
            !username ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        var users = getUserCollection();

        var normalizedEmail = email.toLowerCase().trim();
        var normalizedUsername = username.toLowerCase().trim();

        var existingEmail = await users.findOne({
            email: normalizedEmail
        });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email is already registered."
            });
        }

        var existingUsername = await users.findOne({
            username: normalizedUsername
        });

        if (existingUsername) {
            return res.status(400).json({
                message: "Username is already taken."
            });
        }

        var hashedPassword = await bcrypt.hash(password, 10);

        var newUser = {
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,

            // Prepared for future email verification
            emailVerified: false,

            createdAt: new Date(),
            updatedAt: new Date()
        };

        var result = await users.insertOne(newUser);

        res.status(201).json({
            message: "User registered successfully.",
            userId: result.insertedId
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// LOGIN
router.post("/login", async function (req, res) {
    try {
        var { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                message: "Email/username and password are required."
            });
        }

        var users = getUserCollection();

        var normalizedLogin = login.toLowerCase().trim();

        var user = await users.findOne({
            $or: [
                {
                    email: normalizedLogin
                },
                {
                    username: normalizedLogin
                }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email/username or password."
            });
        }

        var passwordIsCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordIsCorrect) {
            return res.status(401).json({
                message: "Invalid email/username or password."
            });
        }

        var token = jwt.sign(
            {
                userId: user._id.toString(),
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful.",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                emailVerified: user.emailVerified
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// GET CURRENT USER
router.get("/me", authMiddleware, async function (req, res) {
    try {
        var users = getUserCollection();

        var user = await users.findOne(
            {
                _id: new ObjectId(req.user.userId)
            },
            {
                projection: {
                    password: 0
                }
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({
            user: user
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

module.exports = router;