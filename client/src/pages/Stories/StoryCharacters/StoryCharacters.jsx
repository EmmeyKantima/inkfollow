import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users,
    Plus,
    MoreHorizontal,
    X,
    Pencil,
    Trash2,
    ArrowLeft
} from "lucide-react";

import API_URL from "../../../api/api";

import "./StoryCharacters.css";

function StoryCharacters() {
    var { storyId } = useParams();
    var navigate = useNavigate();

    var [characters, setCharacters] = useState([]);
    var [loading, setLoading] = useState(true);
    var [error, setError] = useState("");

    var [selectedCharacter, setSelectedCharacter] =
        useState(null);

    var [showForm, setShowForm] = useState(false);
    var [editingCharacter, setEditingCharacter] =
        useState(null);

    var [showDeleteModal, setShowDeleteModal] =
        useState(false);
    var [deletingCharacter, setDeletingCharacter] =
        useState(null);

    var [name, setName] = useState("");
    var [personality, setPersonality] = useState("");
    var [background, setBackground] = useState("");
    var [appearance, setAppearance] = useState("");
    var [goals, setGoals] = useState("");
    var [details, setDetails] = useState("");

    var [saving, setSaving] = useState(false);
    var [deleting, setDeleting] = useState(false);
    var [formError, setFormError] = useState("");

    var [openMenuId, setOpenMenuId] = useState(null);

    useEffect(function () {
        loadCharacters();
    }, [storyId]);

    async function loadCharacters() {
        try {
            setLoading(true);
            setError("");

            var token = localStorage.getItem(
                "inkspireToken"
            );

            var response = await fetch(
                API_URL +
                    "/characters/story/" +
                    storyId,
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
                        "Failed to load characters."
                );
                return;
            }

            setCharacters(data);
        } catch (error) {
            console.error(
                "Load characters error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    }

    // OPEN CREATE FORM
    function openCreateForm() {
        setEditingCharacter(null);

        setName("");
        setPersonality("");
        setBackground("");
        setAppearance("");
        setGoals("");
        setDetails("");

        setFormError("");
        setShowForm(true);
    }

    // OPEN EDIT FORM
    function openEditForm(character) {
        setEditingCharacter(character);

        setName(character.name || "");
        setPersonality(
            character.personality || ""
        );
        setBackground(
            character.background || ""
        );
        setAppearance(
            character.appearance || ""
        );
        setGoals(character.goals || "");
        setDetails(character.details || "");

        setFormError("");
        setSelectedCharacter(null);
        setOpenMenuId(null);
        setShowForm(true);
    }

    // CLOSE FORM
    function closeForm() {
        if (saving) {
            return;
        }

        setShowForm(false);
        setFormError("");
        setEditingCharacter(null);
    }

    // CREATE / UPDATE CHARACTER
    async function handleSubmit(event) {
        event.preventDefault();

        setFormError("");

        if (!name.trim()) {
            setFormError(
                "Character name is required."
            );
            return;
        }

        setSaving(true);

        try {
            var token = localStorage.getItem(
                "inkspireToken"
            );

            var isEditing =
                editingCharacter !== null;

            var url = isEditing
                ? API_URL +
                  "/characters/" +
                  editingCharacter._id
                : API_URL + "/characters";

            var method = isEditing
                ? "PUT"
                : "POST";

            var body = {
                name: name,
                personality: personality,
                background: background,
                appearance: appearance,
                goals: goals,
                details: details
            };

            if (!isEditing) {
                body.storyId = storyId;
            }

            var response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        "Bearer " + token
                },
                body: JSON.stringify(body)
            });

            var data = await response.json();

            if (!response.ok) {
                setFormError(
                    data.message ||
                        "Unable to save character."
                );
                return;
            }

            if (isEditing) {
                setCharacters(function (
                    currentCharacters
                ) {
                    return currentCharacters.map(
                        function (character) {
                            if (
                                character._id ===
                                data._id
                            ) {
                                return data;
                            }

                            return character;
                        }
                    );
                });
            } else {
                setCharacters(function (
                    currentCharacters
                ) {
                    return [
                        data,
                        ...currentCharacters
                    ];
                });
            }

            setShowForm(false);
            setEditingCharacter(null);
        } catch (error) {
            console.error(
                "Save character error:",
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
    function openDeleteModal(character) {
        setDeletingCharacter(character);
        setOpenMenuId(null);
        setShowDeleteModal(true);
    }

    // CLOSE DELETE MODAL
    function closeDeleteModal() {
        if (deleting) {
            return;
        }

        setShowDeleteModal(false);
        setDeletingCharacter(null);
    }

    // DELETE CHARACTER
    async function handleDelete() {
        if (!deletingCharacter) {
            return;
        }

        setDeleting(true);

        try {
            var token = localStorage.getItem(
                "inkspireToken"
            );

            var response = await fetch(
                API_URL +
                    "/characters/" +
                    deletingCharacter._id,
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
                alert(
                    data.message ||
                        "Unable to delete character."
                );
                return;
            }

            setCharacters(function (
                currentCharacters
            ) {
                return currentCharacters.filter(
                    function (character) {
                        return (
                            character._id !==
                            deletingCharacter._id
                        );
                    }
                );
            });

            if (
                selectedCharacter &&
                selectedCharacter._id ===
                    deletingCharacter._id
            ) {
                setSelectedCharacter(null);
            }

            setShowDeleteModal(false);
            setDeletingCharacter(null);
        } catch (error) {
            console.error(
                "Delete character error:",
                error
            );

            alert(
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

    // SHOW CHARACTER DETAILS
    if (selectedCharacter) {
        return (
            <div className="characters-page">

                <button
                    className="character-back-button"
                    type="button"
                    onClick={function () {
                        setSelectedCharacter(null);
                    }}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Characters</span>
                </button>

                <div className="character-detail-header">
                    <div>
                        <p className="page-eyebrow">
                            CHARACTER
                        </p>

                        <h1>
                            {selectedCharacter.name}
                        </h1>

                    </div>

                    <button
                        className="edit-character-button"
                        type="button"
                        onClick={function () {
                            openEditForm(
                                selectedCharacter
                            );
                        }}
                    >
                        <Pencil size={15} />
                        <span>
                            Edit Character
                        </span>
                    </button>
                </div>

                <div className="character-detail-section">

                    <div className="character-detail-heading">
                        <h2>Personality</h2>
                    </div>

                    <div className="character-detail-content">
                        {selectedCharacter.personality ? (
                            <p>
                                {
                                    selectedCharacter.personality
                                }
                            </p>
                        ) : (
                            <p className="empty-text">
                                No personality added
                                yet.
                            </p>
                        )}
                    </div>

                </div>

                <div className="character-detail-section">

                    <div className="character-detail-heading">
                        <h2>Background</h2>
                    </div>

                    <div className="character-detail-content">
                        {selectedCharacter.background ? (
                            <p>
                                {
                                    selectedCharacter.background
                                }
                            </p>
                        ) : (
                            <p className="empty-text">
                                No background added
                                yet.
                            </p>
                        )}
                    </div>

                </div>

                <div className="character-detail-section">

                    <div className="character-detail-heading">
                        <h2>Appearance</h2>
                    </div>

                    <div className="character-detail-content">
                        {selectedCharacter.appearance ? (
                            <p>
                                {
                                    selectedCharacter.appearance
                                }
                            </p>
                        ) : (
                            <p className="empty-text">
                                No appearance added
                                yet.
                            </p>
                        )}
                    </div>

                </div>

                <div className="character-detail-section">

                    <div className="character-detail-heading">
                        <h2>Goals</h2>
                    </div>

                    <div className="character-detail-content">
                        {selectedCharacter.goals ? (
                            <p>
                                {
                                    selectedCharacter.goals
                                }
                            </p>
                        ) : (
                            <p className="empty-text">
                                No goals added yet.
                            </p>
                        )}
                    </div>

                </div>

                <div className="character-detail-section">

                    <div className="character-detail-heading">
                        <h2>Additional Details</h2>
                    </div>

                    <div className="character-detail-content">
                        {selectedCharacter.details ? (
                            <p>
                                {
                                    selectedCharacter.details
                                }
                            </p>
                        ) : (
                            <p className="empty-text">
                                No additional details
                                added yet.
                            </p>
                        )}
                    </div>

                </div>

                <div className="character-detail-footer">
                    <span>
                        Last updated{" "}
                        {formatDate(
                            selectedCharacter.updatedAt
                        )}
                    </span>

                    <button
                        className="character-delete-button"
                        type="button"
                        onClick={function () {
                            openDeleteModal(
                                selectedCharacter
                            );
                        }}
                    >
                        <Trash2 size={15} />
                        <span>
                            Delete Character
                        </span>
                    </button>
                </div>

                {showForm && renderCharacterForm()}
                {showDeleteModal &&
                    renderDeleteModal()}
            </div>
        );
    }

    function renderCharacterForm() {
        return (
            <div className="character-modal-overlay">

                <div className="character-modal">

                    <div className="character-modal-header">

                        <div>
                            <p className="modal-eyebrow">
                                {editingCharacter
                                    ? "EDIT CHARACTER"
                                    : "NEW CHARACTER"}
                            </p>

                            <h2>
                                {editingCharacter
                                    ? "Edit Character"
                                    : "Create Character"}
                            </h2>
                        </div>

                        <button
                            className="modal-close-button"
                            type="button"
                            onClick={closeForm}
                            disabled={saving}
                        >
                            <X size={20} />
                        </button>

                    </div>

                    <form
                        className="character-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">
                            <label>
                                Character Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={function (
                                    event
                                ) {
                                    setName(
                                        event.target.value
                                    );
                                }}
                                placeholder="Enter character name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Personality
                            </label>

                            <textarea
                                value={personality}
                                onChange={function (
                                    event
                                ) {
                                    setPersonality(
                                        event.target.value
                                    );
                                }}
                                placeholder="Describe the character's personality."
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>
                                Background
                            </label>

                            <textarea
                                value={background}
                                onChange={function (
                                    event
                                ) {
                                    setBackground(
                                        event.target.value
                                    );
                                }}
                                placeholder="Describe the character's background."
                                rows="4"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>
                                Appearance
                            </label>

                            <textarea
                                value={appearance}
                                onChange={function (
                                    event
                                ) {
                                    setAppearance(
                                        event.target.value
                                    );
                                }}
                                placeholder="Describe the character's appearance."
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>
                                Goals
                            </label>

                            <textarea
                                value={goals}
                                onChange={function (
                                    event
                                ) {
                                    setGoals(
                                        event.target.value
                                    );
                                }}
                                placeholder="What does this character want?"
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>
                                Additional Details
                            </label>

                            <textarea
                                value={details}
                                onChange={function (
                                    event
                                ) {
                                    setDetails(
                                        event.target.value
                                    );
                                }}
                                placeholder="Add any other useful information."
                                rows="4"
                            ></textarea>
                        </div>

                        {formError && (
                            <p className="form-error">
                                {formError}
                            </p>
                        )}

                        <div className="character-form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={closeForm}
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
                                    : editingCharacter
                                    ? "Save Changes"
                                    : "Create Character"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        );
    }

    function renderDeleteModal() {
        return (
            <div className="character-modal-overlay">

                <div className="delete-modal">

                    <div className="delete-modal-icon">
                        <Trash2 size={21} />
                    </div>

                    <h2>
                        Delete Character?
                    </h2>

                    <p>
                        Are you sure you want to
                        delete{" "}
                        <strong>
                            {deletingCharacter &&
                                deletingCharacter.name}
                        </strong>
                        ? This action cannot be
                        undone.
                    </p>

                    <div className="delete-modal-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                closeDeleteModal
                            }
                            disabled={deleting}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="delete-confirm-button"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Character"}
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="characters-page">

            <div className="characters-header">

                <div>
                    <p className="page-eyebrow">
                        CHARACTERS
                    </p>

                    <h1>Character Studio</h1>

                    <p className="characters-description">
                        Create and develop the
                        characters in your story.
                    </p>
                </div>

                <button
                    className="new-character-button"
                    type="button"
                    onClick={openCreateForm}
                >
                    <Plus size={17} />
                    <span>New Character</span>
                </button>

            </div>

            {loading && (
                <div className="characters-status">
                    Loading characters...
                </div>
            )}

            {!loading && error && (
                <div className="characters-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                characters.length === 0 && (
                    <div className="characters-list">

                        <div className="characters-empty">

                            <div className="characters-empty-icon">
                                <Users size={22} />
                            </div>

                            <div>
                                <strong>
                                    No characters yet
                                </strong>

                                <p>
                                    Start by creating
                                    your first character.
                                </p>
                            </div>

                        </div>

                    </div>
                )}

            {!loading &&
                !error &&
                characters.length > 0 && (
                    <div className="characters-list">

                        <div className="characters-list-header">
                            <span>Character</span>
                            <span>Personality</span>
                            <span>Appearance</span>
                        </div>

                        {characters.map(
                            function (character) {
                                return (
                                    <div
                                        className="character-row"
                                        key={character._id}
                                        onClick={function () {
                                            setSelectedCharacter(character);
                                        }}
                                    >
                                        <button
                                            className="character-name-button"
                                            type="button"
                                        >
                                            <span className="character-icon">
                                                <Users
                                                    size={
                                                        16
                                                    }
                                                />
                                            </span>

                                            <strong>
                                                {
                                                    character.name
                                                }
                                            </strong>
                                        </button>

                                        <span className="character-preview">
                                            {character.personality ||
                                                "—"}
                                        </span>

                                        <span className="character-preview">
                                            {character.appearance ||
                                                "—"}
                                        </span>

                                        <div className="character-action">
                                            <button
                                                className="character-menu-button"
                                                type="button"
                                                onClick={function (
                                                    event
                                                ) {
                                                    event.stopPropagation();

                                                    setOpenMenuId(
                                                        openMenuId ===
                                                            character._id
                                                            ? null
                                                            : character._id
                                                    );
                                                }}
                                            >
                                                <MoreHorizontal
                                                    size={
                                                        18
                                                    }
                                                />
                                            </button>

                                            {openMenuId ===
                                                character._id && (
                                                <div className="character-menu">

                                                    <button
                                                        type="button"
                                                        onClick={function () {
                                                            openEditForm(
                                                                character
                                                            );
                                                        }}
                                                    >
                                                        <Pencil
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="menu-delete"
                                                        onClick={function () {
                                                            openDeleteModal(
                                                                character
                                                            );
                                                        }}
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Delete
                                                    </button>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            {showForm && renderCharacterForm()}
            {showDeleteModal &&
                renderDeleteModal()}

        </div>
    );
}

export default StoryCharacters;