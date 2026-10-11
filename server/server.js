var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");
var path = require("path");

dotenv.config({
    path: path.join(__dirname, ".env")
});

var { connectDB } = require("./config/db");

var authRoutes = require("./routes/authRoutes");
var ideaRoutes = require("./routes/ideaRoutes");
var storyRoutes = require("./routes/storyRoutes");
var characterRoutes = require("./routes/characterRoutes");
var worldRoutes = require("./routes/worldRoutes");
var actRoutes = require("./routes/actRoutes");
var chapterRoutes = require("./routes/chapterRoutes");
var eventRoutes = require("./routes/eventRoutes");
var sceneRoutes = require("./routes/sceneRoutes");
var draftRoutes = require("./routes/draftRoutes");
var storyCheckRoutes = require("./routes/storyCheckRoutes");

var app = express();
var PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/world", worldRoutes);
app.use("/api/acts", actRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/scenes", sceneRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/story-check", storyCheckRoutes);

app.get("/api/health", function (req, res) {
    res.json({
        message: "Inkspire API is running"
    });
});

connectDB();

app.listen(PORT, function () {
    console.log("Inkspire server running on port " + PORT);
});