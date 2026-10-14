import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    BookOpen,
    Clock3,
    FileText,
    Pencil,
    X
} from "lucide-react";

import API_URL from "../../../api/api";

import "./StoryOverview.css";

function StoryOverview() {
    var { storyId } = useParams();

    var [story, setStory] = useState(null);
    var [loading, setLoading] = useState(true);
    var [error, setError] = useState("");

    var [showForm, setShowForm] = useState(false);
    var [title, setTitle] = useState("");
    var [genre, setGenre] = useState("");
    var [synopsis, setSynopsis] = useState("");
    var [plot, setPlot] = useState("");
    var [saving, setSaving] = useState(false);
    var [formError, setFormError] = useState("");

    useEffect(function () {
        loadStory();
    }, [storyId]);

    async function loadStory() {
        try {
            setLoading(true);
            setError("");

            var token = localStorage.getItem(
                "inkspireToken"
            );

            var response = await fetch(
                API_URL + "/stories/" + storyId,
                {
                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "Failed to load story."
                );
                return;
            }

            setStory(data);
        } catch (error) {
            console.error(
                "Load story error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    }

    // OPEN EDIT FORM
    function openEditForm() {
        setTitle(story.title || "");
        setGenre(story.genre || "");
        setSynopsis(story.synopsis || "");
        setPlot(story.plot || "");
        setFormError("");
        setShowForm(true);
    }

    // CLOSE EDIT FORM
    function closeEditForm() {
        if (saving) {
            return;
        }

        setShowForm(false);
        setFormError("");
    }

    // UPDATE STORY
    async function handleSubmit(event) {
        event.preventDefault();

        setFormError("");

        if (!title.trim()) {
            setFormError(
                "Story title is required."
            );
            return;
        }

        setSaving(true);

        try {
            var token = localStorage.getItem(
                "inkspireToken"
            );

            var response = await fetch(
                API_URL + "/stories/" + storyId,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            "Bearer " + token
                    },
                    body: JSON.stringify({
                        title: title,
                        genre: genre,
                        synopsis: synopsis,
                        plot: plot
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setFormError(
                    data.message ||
                        "Unable to update story."
                );
                return;
            }

            setStory(data);
            setShowForm(false);
        } catch (error) {
            console.error(
                "Update story error:",
                error
            );

            setFormError(
                "Unable to connect to the server."
            );
        } finally {
            setSaving(false);
        }
    }

    function formatDate(date) {
        if (!date) {
            return "No date";
        }

        return new Date(date).toLocaleDateString(
            "en-CA",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }

    if (loading) {
        return (
            <div className="story-overview-page">
                <div className="story-overview-status">
                    Loading story...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="story-overview-page">
                <div className="story-overview-error">
                    {error}
                </div>
            </div>
        );
    }

    if (!story) {
        return null;
    }

    return (
        <div className="story-overview-page">

            <div className="story-overview-header">

                <div>
                    <p className="page-eyebrow">
                        STORY OVERVIEW
                    </p>

                    <h1>{story.title}</h1>

                    <p className="story-overview-description">
                        Your central workspace for
                        developing this story.
                    </p>
                </div>

                <div className="story-overview-header-right">

                    <div className="story-overview-meta">
                        <span>
                            {story.genre ||
                                "No genre"}
                        </span>

    
                    </div>

                    <button
                        className="edit-story-button"
                        type="button"
                        onClick={openEditForm}
                    >
                        <Pencil size={15} />
                        <span>Edit Story</span>
                    </button>

                </div>

            </div>

            <div className="story-overview-section">

                <div className="section-heading">
                    <BookOpen size={19} />

                    <div>
                        <h2>Synopsis</h2>

                        <p>
                            A short summary of
                            your story.
                        </p>
                    </div>
                </div>

                <div className="story-overview-content">
                    {story.synopsis ? (
                        <p>
                            {story.synopsis}
                        </p>
                    ) : (
                        <p className="empty-text">
                            No synopsis added yet.
                        </p>
                    )}
                </div>

            </div>

            <div className="story-overview-section">

                <div className="section-heading">
                    <FileText size={19} />

                    <div>
                        <h2>Overall Plot</h2>

                        <p>
                            The main direction and
                            events of your story.
                        </p>
                    </div>
                </div>

                <div className="story-overview-content">
                    {story.plot ? (
                        <p>{story.plot}</p>
                    ) : (
                        <p className="empty-text">
                            No overall plot added yet.
                        </p>
                    )}
                </div>

            </div>

            <div className="story-overview-section story-overview-info">

                <div className="section-heading">
                    <Clock3 size={19} />

                    <div>
                        <h2>
                            Story Information
                        </h2>

                        <p>
                            Basic information about
                            this writing project.
                        </p>
                    </div>
                </div>

                <div className="story-info-list">

                    <div className="story-info-row">
                        <span>Genre</span>

                        <strong>
                            {story.genre ||
                                "Not set"}
                        </strong>
                    </div>

                    <div className="story-info-row">
                        <span>Created</span>

                        <strong>
                            {formatDate(
                                story.createdAt
                            )}
                        </strong>
                    </div>

                    <div className="story-info-row">
                        <span>Last Updated</span>

                        <strong>
                            {formatDate(
                                story.updatedAt
                            )}
                        </strong>
                    </div>

                </div>

            </div>

            {showForm && (
                <div className="story-modal-overlay">

                    <div className="story-modal">

                        <div className="story-modal-header">

                            <div>
                                <p className="modal-eyebrow">
                                    EDIT STORY
                                </p>

                                <h2>
                                    Edit Story
                                </h2>
                            </div>

                            <button
                                className="modal-close-button"
                                type="button"
                                onClick={
                                    closeEditForm
                                }
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="story-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-group">
                                <label>
                                    Story Title
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={function (
                                        event
                                    ) {
                                        setTitle(
                                            event.target
                                                .value
                                        );
                                    }}
                                    placeholder="Enter your story title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Genre
                                </label>

                                <input
                                    type="text"
                                    value={genre}
                                    onChange={function (
                                        event
                                    ) {
                                        setGenre(
                                            event.target
                                                .value
                                        );
                                    }}
                                    placeholder="e.g. Fantasy, Mystery, Romance"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Synopsis
                                </label>

                                <textarea
                                    value={synopsis}
                                    onChange={function (
                                        event
                                    ) {
                                        setSynopsis(
                                            event.target
                                                .value
                                        );
                                    }}
                                    placeholder="What is your story about?"
                                    rows="4"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>
                                    Overall Plot
                                </label>

                                <textarea
                                    value={plot}
                                    onChange={function (
                                        event
                                    ) {
                                        setPlot(
                                            event.target
                                                .value
                                        );
                                    }}
                                    placeholder="Describe the main plot or story direction."
                                    rows="5"
                                ></textarea>
                            </div>

                            {formError && (
                                <p className="form-error">
                                    {formError}
                                </p>
                            )}

                            <div className="story-form-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeEditForm
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default StoryOverview;