var express = require("express");
var { ObjectId } = require("mongodb");

var { getIdeaCollection } = require("../models/Idea");
var authMiddleware = require("../middleware/authMiddleware");

var router = express.Router();


// GET ALL IDEAS
router.get("/", authMiddleware, async function (req, res) {
    try {
        var ideas = getIdeaCollection();

        var userIdeas = await ideas
            .find({
                userId: new ObjectId(req.user.userId)
            })
            .sort({
                updatedAt: -1
            })
            .toArray();

        res.json({
            ideas: userIdeas
        });

    } catch (error) {
        console.error("Get ideas error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


 // GET LATEST IDEA
router.get("/latest", authMiddleware, async function (req, res) {
    try {
        var ideas = getIdeaCollection();

        var idea = await ideas.findOne(
            {
                userId: new ObjectId(req.user.userId)
            },
            {
                sort: { createdAt: -1 }
            }
        );

        res.json({
            idea: idea
        });

    } catch (error) {
        console.error("Get latest idea error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// CREATE IDEA
router.post("/", authMiddleware, async function (req, res) {
    try {
        var {
            title,
            description
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Idea title is required."
            });
        }

        var ideas = getIdeaCollection();

        var newIdea = {
            userId: new ObjectId(req.user.userId),

            title: title.trim(),

            description: description
                ? description.trim()
                : "",

            createdAt: new Date(),
            updatedAt: new Date()
        };

        var result = await ideas.insertOne(newIdea);

        res.status(201).json({
            message: "Idea created successfully.",
            idea: {
                _id: result.insertedId,
                ...newIdea
            }
        });

    } catch (error) {
        console.error("Create idea error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// GET ONE IDEA
router.get("/:id", authMiddleware, async function (req, res) {
    try {
        var ideas = getIdeaCollection();

        var idea = await ideas.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found."
            });
        }

        res.json({
            idea: idea
        });

    } catch (error) {
        console.error("Get idea error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// UPDATE IDEA
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        var {
            title,
            description
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Idea title is required."
            });
        }

        var ideas = getIdeaCollection();

        var result = await ideas.updateOne(
            {
                _id: new ObjectId(req.params.id),
                userId: new ObjectId(req.user.userId)
            },
            {
                $set: {
                    title: title.trim(),

                    description: description
                        ? description.trim()
                        : "",

                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Idea not found."
            });
        }

        res.json({
            message: "Idea updated successfully."
        });

    } catch (error) {
        console.error("Update idea error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// DELETE IDEA
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        var ideas = getIdeaCollection();

        var result = await ideas.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Idea not found."
            });
        }

        res.json({
            message: "Idea deleted successfully."
        });

    } catch (error) {
        console.error("Delete idea error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


module.exports = router;