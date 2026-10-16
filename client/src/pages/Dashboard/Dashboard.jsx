
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, PenLine } from "lucide-react";
import API_URL from "../../api/api";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadLatestDrafts() {
            try {
                const response = await fetch(`${API_URL}/drafts/latest`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("inkspireToken")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Could not load your latest drafts.");
                }

                const data = await response.json();
                setDrafts(Array.isArray(data) ? data : []);
            } catch (error) {
                setError("Unable to load your latest drafts.");
            } finally {
                setLoading(false);
            }
        }

        loadLatestDrafts();
    }, []);

    function continueWriting(draft) {
        navigate(
            `/stories/${draft.storyId}/writing?chapterId=${draft.chapterId}`
        );
    }

    function formatDate(date) {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <p className="page-eyebrow">YOUR WRITING SPACE</p>
                    <h1>Dashboard</h1>
                    
                </div>
            </header>

            <section className="continue-writing">
                <div className="continue-writing-heading">
                    <div>
                        <p className="page-eyebrow">YOUR LATEST WORK</p>
                        <h2>Continue Writing</h2>
                    </div>
                    <PenLine size={22} />
                </div>

                {loading ? (
                    <p className="dashboard-message">
                        Loading your latest drafts...
                    </p>
                ) : error ? (
                    <p className="dashboard-message dashboard-error">
                        {error}
                    </p>
                ) : drafts.length > 0 ? (
                    <div className="continue-writing-list">
                        {drafts.map((draft) => (
                            <button
                                key={draft._id}
                                className="continue-writing-row"
                                onClick={() => continueWriting(draft)}
                            >
                                <div className="continue-writing-icon">
                                    <PenLine size={18} />
                                </div>

                                <div className="continue-writing-info">
                                    <h3>{draft.title || "Untitled Chapter"}</h3>
                                    <p>
                                        <Clock3 size={14} />
                                        Last edited {formatDate(draft.updatedAt)}
                                    </p>
                                </div>

                                <span className="continue-writing-action">
                                    Continue
                                    <ArrowRight size={16} />
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="dashboard-empty">
                        <div className="continue-writing-icon">
                            <PenLine size={18} />
                        </div>
                        <div>
                            <h3>No drafts yet</h3>
                            <p>
                                Start writing a chapter and your latest work will appear here.
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
