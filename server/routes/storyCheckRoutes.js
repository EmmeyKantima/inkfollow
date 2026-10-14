
var express = require("express");
var { ObjectId } = require("mongodb");
var authMiddleware = require("../middleware/authMiddleware");
var { getDB } = require("../config/db");
var { getStoryCollection } = require("../models/Story");
var { getCharacterCollection } = require("../models/Character");
var { getChapterCollection } = require("../models/Chapter");
var { getEventCollection } = require("../models/Event");
var { getSceneCollection } = require("../models/Scene");
var { getDraftCollection } = require("../models/Draft");

var router = express.Router();
router.use(authMiddleware);

function isValidId(id) {
    return ObjectId.isValid(id);
}

function stripHtml(content) {
    return String(content || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

async function getChapterData(storyId, chapterId, userId) {
    if (!isValidId(storyId) || !isValidId(chapterId)) {
        return null;
    }

    var userObjectId = new ObjectId(userId);

    var story = await getStoryCollection().findOne({
        _id: new ObjectId(storyId),
        userId: userObjectId
    });

    if (!story) {
        return null;
    }

    var chapter = await getChapterCollection().findOne({
        _id: new ObjectId(chapterId),
        storyId: storyId,
        userId: userObjectId
    });

    if (!chapter) {
        return null;
    }

    var characters = await getCharacterCollection().find({
        storyId: new ObjectId(storyId),
        userId: userObjectId
    }).toArray();

    var draft = await getDraftCollection().findOne({
        chapterId: String(chapterId),
        userId: String(userId)
    });

    var events = await getEventCollection().find({
        chapterId: String(chapterId),
        userId: userObjectId
    }).toArray();

    var eventIds = events.map(function (event) {
        return String(event._id);
    });

    var scenes = eventIds.length
        ? await getSceneCollection().find({
            eventId: { $in: eventIds },
            userId: userObjectId
        }).toArray()
        : [];

    var content = stripHtml(draft ? draft.content : "");
    var lowerContent = content.toLowerCase();

    // FIND CHARACTERS MENTIONED IN THE CHAPTER
    var mentionedCharacters = characters.filter(function (character) {
        var name = String(character.name || "").trim().toLowerCase();
        return name && lowerContent.includes(name);
    });

    var items = [];

    mentionedCharacters.forEach(function (character) {
        items.push({
            id: "character:" + String(character._id),
            type: "character",
            category: "Characters",
            label: character.name,
            description: "Confirm this character's details match the chapter.",
            completed: false
        });
    });

    events.forEach(function (event) {
        items.push({
            id: "event:" + String(event._id),
            type: "event",
            category: "Story Structure",
            label: event.title || "Untitled event",
            description: "Check whether this planned event is reflected in the chapter.",
            completed: false
        });
    });

    scenes.forEach(function (scene) {
        items.push({
            id: "scene:" + String(scene._id),
            type: "scene",
            category: "Story Structure",
            label: scene.title || "Untitled scene",
            description: "Check whether this planned scene is reflected in the chapter.",
            completed: false
        });
    });

    return {
        chapter: chapter,
        items: items
    };
}

async function getSavedCheck(storyId, chapterId, userId) {
    return getDB().collection("storyChecks").findOne({
        storyId: String(storyId),
        chapterId: String(chapterId),
        userId: new ObjectId(userId)
    });
}

// LOAD MANUAL CHECKLIST
router.get("/:storyId/chapter/:chapterId", async function (req, res) {
    try {
        var storyId = req.params.storyId;
        var chapterId = req.params.chapterId;

        var data = await getChapterData(
            storyId,
            chapterId,
            req.user.userId
        );

        if (!data) {
            return res.status(404).json({
                message: "Story or chapter not found."
            });
        }

        var saved = await getSavedCheck(
            storyId,
            chapterId,
            req.user.userId
        );

        var completedIds = new Set(
            (saved && saved.manualChecks ? saved.manualChecks : [])
                .filter(function (item) {
                    return item.completed;
                })
                .map(function (item) {
                    return item.id;
                })
        );

        var manualChecks = data.items.map(function (item) {
            return {
                ...item,
                completed: completedIds.has(item.id)
            };
        });

        res.json({
            chapter: {
                id: String(data.chapter._id),
                title: data.chapter.title
            },
            manualChecks: manualChecks
        });
    } catch (error) {
        console.error("Load chapter Story Check error:", error);

        res.status(500).json({
            message: "Unable to load Story Check for this chapter."
        });
    }
});

// SAVE MANUAL CHECKLIST
router.put("/:storyId/chapter/:chapterId/manual", async function (req, res) {
    try {
        var storyId = req.params.storyId;
        var chapterId = req.params.chapterId;

        var data = await getChapterData(
            storyId,
            chapterId,
            req.user.userId
        );

        if (!data) {
            return res.status(404).json({
                message: "Story or chapter not found."
            });
        }

        if (!Array.isArray(req.body.manualChecks)) {
            return res.status(400).json({
                message: "Manual checklist is required."
            });
        }

        var submitted = new Map(
            req.body.manualChecks.map(function (item) {
                return [item.id, item.completed === true];
            })
        );

        var manualChecks = data.items.map(function (item) {
            return {
                ...item,
                completed: submitted.get(item.id) === true
            };
        });

        var now = new Date();

        await getDB().collection("storyChecks").updateOne(
            {
                storyId: String(storyId),
                chapterId: String(chapterId),
                userId: new ObjectId(req.user.userId)
            },
            {
                $set: {
                    manualChecks: manualChecks,
                    updatedAt: now
                },
                $setOnInsert: {
                    createdAt: now
                }
            },
            { upsert: true }
        );

        res.json({
            message: "Checklist saved.",
            manualChecks: manualChecks
        });
    } catch (error) {
        console.error("Save chapter checklist error:", error);

        res.status(500).json({
            message: "Unable to save the checklist."
        });
    }
});

module.exports = router;
