var express = require("express");
var { ObjectId } = require("mongodb");

var authMiddleware = require("../middleware/authMiddleware");
var { getDraftCollection } = require("../models/Draft");

var router = express.Router();

router.use(authMiddleware);


/* GET LATEST DRAFT */
router.get("/latest", async function (req, res) {
    try {
        var collection = getDraftCollection();

        var draft = await collection.findOne(
            {
                userId: req.user.userId,
                content: { $regex: /\S/ }
            },
            {
                sort: { updatedAt: -1, createdAt: -1 }
            }
        );

        res.json(draft || null);

    } catch (error) {
        console.error("Get latest draft error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// GET DRAFT FOR CHAPTER
router.get("/chapter/:chapterId", async function (req, res) {
    try {
        var chapterId = req.params.chapterId;

        if (!ObjectId.isValid(chapterId)) {
            return res.status(400).json({
                message: "Invalid chapter ID."
            });
        }

        var collection = getDraftCollection();

        var draft = await collection.findOne({
            chapterId: chapterId,
            userId: req.user.userId
        });

        if (!draft) {
            return res.json({
                chapterId: chapterId,
                title: "",
                content: ""
            });
        }

        res.json(draft);

    } catch (error) {
        console.error("Get draft error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// CREATE OR UPDATE DRAFT
router.put("/chapter/:chapterId", async function (req, res) {
    try {
        var chapterId = req.params.chapterId;

        if (!ObjectId.isValid(chapterId)) {
            return res.status(400).json({
                message: "Invalid chapter ID."
            });
        }

        var title = req.body.title || "";
        var content = req.body.content || "";

        var collection = getDraftCollection();

        var now = new Date();

        await collection.updateOne(
            {
                chapterId: chapterId,
                userId: req.user.userId
            },
            {
                $set: {
                    chapterId: chapterId,
                    storyId: req.body.storyId || "",
                    userId: req.user.userId,
                    title: title,
                    content: content,
                    updatedAt: now
                },
                $setOnInsert: {
                    createdAt: now
                }
            },
            {
                upsert: true
            }
        );

        var draft = await collection.findOne({
            chapterId: chapterId,
            userId: req.user.userId
        });

        res.json({
            message: "Draft saved successfully.",
            draft: draft
        });

    } catch (error) {
        console.error("Save draft error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

module.exports = router;