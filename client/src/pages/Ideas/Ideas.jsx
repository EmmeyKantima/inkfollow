import { useEffect, useState } from "react";
import {
    Lightbulb,
    Plus,
    MoreHorizontal,
    X,
    Trash2,
    ArrowLeft,
    Pencil
} from "lucide-react";

import API_URL from "../../api/api";
import "./Ideas.css";

function Ideas() {
    var [ideas, setIdeas] = useState([]);
    var [loading, setLoading] = useState(true);
    var [error, setError] = useState("");

    var [selectedIdea, setSelectedIdea] = useState(null);

    var [showForm, setShowForm] = useState(false);
    var [title, setTitle] = useState("");
    var [description, setDescription] = useState("");
    var [saving, setSaving] = useState(false);
    var [formError, setFormError] = useState("");
    var [editingIdea, setEditingIdea] = useState(null);

    var [openMenuId, setOpenMenuId] = useState(null);
    var [menuPosition, setMenuPosition] = useState(null);

    var [deleteIdea, setDeleteIdea] = useState(null);
    var [deleting, setDeleting] = useState(false);

    useEffect(function () {
        loadIdeas();
    }, []);

    useEffect(function () {
        function handleClickOutside() {
            setOpenMenuId(null);
            setMenuPosition(null);
        }

        if (openMenuId) {
            document.addEventListener(
                "click",
                handleClickOutside
            );
        }

        return function () {
            document.removeEventListener(
                "click",
                handleClickOutside
            );
        };
    }, [openMenuId]);

    // LOAD IDEAS
    async function loadIdeas() {
        try {
            setLoading(true);
            setError("");

            var token = localStorage.getItem("inkspireToken");

            var response = await fetch(
                API_URL + "/ideas",
                {
                    method: "GET",
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Unable to load ideas."
                );
                return;
            }

            setIdeas(data.ideas);
        } catch (error) {
            console.error("Load ideas error:", error);
            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    }

    // OPEN CREATE FORM
    function openCreateForm() {
        setSelectedIdea(null);
        setEditingIdea(null);
        setTitle("");
        setDescription("");
        setFormError("");
        setOpenMenuId(null);
        setMenuPosition(null);
        setShowForm(true);
    }

    // OPEN EDIT FORM
    function openEditForm(idea) {
        setEditingIdea(idea);
        setTitle(idea.title);
        setDescription(idea.description || "");
        setFormError("");
        setOpenMenuId(null);
        setMenuPosition(null);
        setShowForm(true);
    }

    // CLOSE FORM
    function closeForm() {
        if (saving) {
            return;
        }

        setEditingIdea(null);
        setTitle("");
        setDescription("");
        setFormError("");
        setShowForm(false);
    }

    // TOGGLE MENU
    function toggleMenu(event, ideaId) {
        event.stopPropagation();

        if (openMenuId === ideaId) {
            setOpenMenuId(null);
            setMenuPosition(null);
            return;
        }

        var button = event.currentTarget;
        var rect = button.getBoundingClientRect();

        setOpenMenuId(ideaId);
        setMenuPosition({
            top: rect.bottom + 6,
            right: window.innerWidth - rect.right
        });
    }

    // SAVE IDEA
    async function handleSubmit(event) {
        event.preventDefault();

        setFormError("");

        if (!title.trim()) {
            setFormError(
                "Idea title is required."
            );
            return;
        }

        setSaving(true);

        try {
            var token = localStorage.getItem(
                "inkspireToken"
            );

            var url;
            var method;

            if (editingIdea) {
                url =
                    API_URL +
                    "/ideas/" +
                    editingIdea._id;
                method = "PUT";
            } else {
                url = API_URL + "/ideas";
                method = "POST";
            }

            var response = await fetch(
                url,
                {
                    method: method,
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            "Bearer " + token
                    },
                    body: JSON.stringify({
                        title: title,
                        description: description
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setFormError(
                    data.message ||
                    "Unable to save idea."
                );
                return;
            }

            if (editingIdea) {
                var updatedIdea = {
                    ...editingIdea,
                    title: title.trim(),
                    description:
                        description.trim(),
                    updatedAt: new Date()
                };

                setIdeas(function (currentIdeas) {
                    return currentIdeas.map(
                        function (idea) {
                            if (
                                idea._id ===
                                editingIdea._id
                            ) {
                                return updatedIdea;
                            }

                            return idea;
                        }
                    );
                });

                if (
                    selectedIdea &&
                    selectedIdea._id ===
                        editingIdea._id
                ) {
                    setSelectedIdea(
                        updatedIdea
                    );
                }
            } else {
                setIdeas(function (currentIdeas) {
                    return [
                        data.idea,
                        ...currentIdeas
                    ];
                });
            }

            setEditingIdea(null);
            setTitle("");
            setDescription("");
            setShowForm(false);
        } catch (error) {
            console.error(
                "Save idea error:",
                error
            );

            setFormError(
                "Unable to connect to the server."
            );
        } finally {
            setSaving(false);
        }
    }

    // OPEN DELETE MODAL
    function openDeleteModal(idea) {
        setOpenMenuId(null);
        setMenuPosition(null);
        setDeleteIdea(idea);
    }

    // CLOSE DELETE MODAL
    function closeDeleteModal() {
        if (deleting) {
            return;
        }

        setDeleteIdea(null);
    }

    // DELETE IDEA
    async function confirmDeleteIdea() {
        if (!deleteIdea) {
            return;
        }

        setDeleting(true);

        try {
            var token = localStorage.getItem(
                "inkspireToken"
            );

            var response = await fetch(
                API_URL +
                    "/ideas/" +
                    deleteIdea._id,
                {
                    method: "DELETE",
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
                    "Unable to delete idea."
                );
                return;
            }

            setIdeas(function (currentIdeas) {
                return currentIdeas.filter(
                    function (idea) {
                        return (
                            idea._id !==
                            deleteIdea._id
                        );
                    }
                );
            });

            if (
                selectedIdea &&
                selectedIdea._id ===
                    deleteIdea._id
            ) {
                setSelectedIdea(null);
            }

            setDeleteIdea(null);
        } catch (error) {
            console.error(
                "Delete idea error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setDeleting(false);
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

    // IDEA DETAIL
    if (selectedIdea) {
        return (
            <div className="ideas-page">

                <button
                    className="idea-back-button"
                    type="button"
                    onClick={function () {
                        setSelectedIdea(null);
                    }}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Ideas</span>
                </button>

                <div className="idea-detail-header">
                    <div>
                        <p className="page-eyebrow">
                            YOUR IDEA VAULT
                        </p>

                        <h1>
                            {selectedIdea.title}
                        </h1>

                        <p className="idea-detail-type">
                            Story Idea
                        </p>
                    </div>

                    <button
                        className="edit-idea-button"
                        type="button"
                        onClick={function () {
                            openEditForm(
                                selectedIdea
                            );
                        }}
                    >
                        <Pencil size={15} />
                        <span>Edit Idea</span>
                    </button>
                </div>

                <div className="idea-detail-section">
                    <div className="idea-detail-heading">
                        <h2>Description</h2>
                    </div>

                    <div className="idea-detail-content">
                        {selectedIdea.description ? (
                            <p>
                                {
                                    selectedIdea.description
                                }
                            </p>
                        ) : (
                            <p className="empty-text">
                                No description added
                                yet.
                            </p>
                        )}
                    </div>
                </div>

                <div className="idea-detail-footer">
                    <div>
                        <span>
                            Created{" "}
                            {formatDate(
                                selectedIdea.createdAt
                            )}
                        </span>

                        <span>
                            Last updated{" "}
                            {formatDate(
                                selectedIdea.updatedAt
                            )}
                        </span>
                    </div>

                    <button
                        className="idea-delete-button"
                        type="button"
                        onClick={function () {
                            openDeleteModal(
                                selectedIdea
                            );
                        }}
                    >
                        <Trash2 size={15} />
                        <span>Delete Idea</span>
                    </button>
                </div>

                {showForm && (
                    renderIdeaForm()
                )}

                {deleteIdea &&
                    renderDeleteModal()}
            </div>
        );
    }

    function renderIdeaForm() {
        return (
            <div className="modal-overlay">
                <div className="idea-modal">

                    <div className="idea-modal-header">
                        <div>
                            <p className="page-eyebrow">
                                {editingIdea
                                    ? "EDIT IDEA"
                                    : "NEW IDEA"}
                            </p>

                            <h2>
                                {editingIdea
                                    ? "Edit Story Idea"
                                    : "Create a Story Idea"}
                            </h2>
                        </div>

                        <button
                            className="close-form-button"
                            type="button"
                            onClick={closeForm}
                            disabled={saving}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form
                        className="idea-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-field">
                            <label htmlFor="idea-title">
                                Title
                            </label>

                            <input
                                id="idea-title"
                                type="text"
                                value={title}
                                onChange={function (
                                    event
                                ) {
                                    setTitle(
                                        event.target.value
                                    );
                                }}
                                placeholder="Enter your idea title"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="idea-description">
                                Description
                            </label>

                            <textarea
                                id="idea-description"
                                value={description}
                                onChange={function (
                                    event
                                ) {
                                    setDescription(
                                        event.target.value
                                    );
                                }}
                                placeholder="Write a short description of your idea..."
                                rows="5"
                            ></textarea>
                        </div>

                        {formError && (
                            <p className="form-error">
                                {formError}
                            </p>
                        )}

                        <div className="idea-form-actions">
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-button"
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingIdea
                                    ? "Save Changes"
                                    : "Save Idea"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    function renderDeleteModal() {
        return (
            <div className="modal-overlay">
                <div className="confirmation-modal">

                    <div className="confirmation-icon">
                        <Trash2 size={21} />
                    </div>

                    <h2>Delete Idea?</h2>

                    <p>
                        Are you sure you want to
                        delete{" "}
                        <strong>
                            "{deleteIdea.title}"
                        </strong>
                        ?
                    </p>

                    <p className="confirmation-note">
                        This action cannot be undone.
                    </p>

                    <div className="confirmation-actions">
                        <button
                            className="secondary-button"
                            type="button"
                            onClick={
                                closeDeleteModal
                            }
                            disabled={deleting}
                        >
                            Cancel
                        </button>

                        <button
                            className="danger-button"
                            type="button"
                            onClick={
                                confirmDeleteIdea
                            }
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Idea"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ideas-page">

            <div className="ideas-header">
                <div>
                    <p className="page-eyebrow">
                        YOUR IDEA VAULT
                    </p>

                    <h1>Ideas</h1>
                </div>

                <button
                    className="primary-button"
                    type="button"
                    onClick={openCreateForm}
                >
                    <Plus size={17} />
                    <span>New Idea</span>
                </button>
            </div>

            {showForm && renderIdeaForm()}

            {loading && (
                <div className="ideas-status">
                    Loading ideas...
                </div>
            )}

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            {!loading &&
                !error &&
                ideas.length === 0 &&
                !showForm && (
                    <div className="ideas-list">
                        <div className="ideas-empty">
                            <div className="ideas-empty-icon">
                                <Lightbulb size={22} />
                            </div>

                            <div>
                                <strong>
                                    No ideas yet
                                </strong>

                                <p>
                                    Start by creating
                                    your first story
                                    idea.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            {!loading &&
                !error &&
                ideas.length > 0 && (
                    <div className="ideas-list">

                        <div className="ideas-list-header">
                            <span>Idea</span>
                            <span>Type</span>
                            <span>Updated</span>
                            <span></span>
                        </div>

                        {ideas.map(function (idea) {
                            return (
                                <div
                                    className="idea-row"
                                    key={idea._id}
                                    onClick={function () {
                                        setSelectedIdea(
                                            idea
                                        );
                                    }}
                                >
                                    <div className="idea-main">
                                        <div className="idea-icon">
                                            <Lightbulb size={19} />
                                        </div>

                                        <div className="idea-info">
                                            <h2>
                                                {idea.title}
                                            </h2>

                                            <p>
                                                {idea.description ||
                                                    "No description yet."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="idea-type">
                                        Story Idea
                                    </div>

                                    <div className="idea-updated">
                                        {new Date(
                                            idea.updatedAt
                                        ).toLocaleDateString()}
                                    </div>

                                    <div className="idea-actions">
                                        <button
                                            className="idea-menu-button"
                                            type="button"
                                            title="More options"
                                            onClick={function (
                                                event
                                            ) {
                                                toggleMenu(
                                                    event,
                                                    idea._id
                                                );
                                            }}
                                        >
                                            <MoreHorizontal
                                                size={18}
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            {openMenuId &&
                menuPosition && (
                    <div
                        className="idea-menu"
                        style={{
                            top:
                                menuPosition.top,
                            right:
                                menuPosition.right
                        }}
                        onClick={function (
                            event
                        ) {
                            event.stopPropagation();
                        }}
                    >
                        {ideas.map(function (
                            idea
                        ) {
                            if (
                                idea._id !==
                                openMenuId
                            ) {
                                return null;
                            }

                            return (
                                <div
                                    key={idea._id}
                                >
                                    <button
                                        type="button"
                                        onClick={function (
                                            event
                                        ) {
                                            event.stopPropagation();
                                            openEditForm(
                                                idea
                                            );
                                        }}
                                    >
                                        Edit Idea
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-menu-item"
                                        onClick={function (
                                            event
                                        ) {
                                            event.stopPropagation();
                                            openDeleteModal(
                                                idea
                                            );
                                        }}
                                    >
                                        Delete Idea
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

            {deleteIdea &&
                !selectedIdea &&
                renderDeleteModal()}
        </div>
    );
}

export default Ideas;