import { useState } from "react";
import { NavLink, useLocation, useParams, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Lightbulb,
    BookOpen,
    Users,
    ListTree,
    Globe,
    PenLine,
    LogOut,
    ArrowLeft,
    X,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
    var location = useLocation();
    var { storyId } = useParams();
    var navigate = useNavigate();

    var [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    var [showLogoutModal, setShowLogoutModal] = useState(false);

    var isStoryPage =
        location.pathname.startsWith("/stories/") &&
        storyId;

    function toggleSidebar() {
        setSidebarCollapsed(!sidebarCollapsed);
    }

    function openLogoutModal() {
        setShowLogoutModal(true);
    }

    function closeLogoutModal() {
        setShowLogoutModal(false);
    }

    function confirmLogout() {
        localStorage.removeItem("inkspireToken");
        localStorage.removeItem("inkspireUser");
        navigate("/login");
    }

    return (
        <>
            <aside
                className={
                    sidebarCollapsed
                        ? "sidebar sidebar-hidden"
                        : "sidebar"
                }
            >
                {!sidebarCollapsed && (
                    <>
                        <div className="sidebar-brand">
                            <div>
                                <h1>Inkfollow</h1>
                                <span>Writing Assistant</span>
                            </div>

                            <button
                                className="sidebar-toggle-button"
                                type="button"
                                title="Hide sidebar"
                                onClick={toggleSidebar}
                            >
                                <PanelLeftClose size={18} />
                            </button>
                        </div>

                        {isStoryPage ? (
                            <nav className="sidebar-navigation">

                                <p className="menu-label">
                                    Story
                                </p>

                                <NavLink
                                    to="/stories"
                                    className="sidebar-back-link"
                                >
                                    <ArrowLeft size={17} />
                                    <span>Back to My Stories</span>
                                </NavLink>

                                <p className="menu-label story-label">
                                    Current Story
                                </p>

                                <NavLink
                                    to={`/stories/${storyId}`}
                                    end
                                    className="sidebar-link"
                                >
                                    <BookOpen size={18} />
                                    <span>Overview</span>
                                </NavLink>

                                <NavLink
                                    to={`/stories/${storyId}/writing`}
                                    className="sidebar-link"
                                >
                                    <PenLine size={18} />
                                    <span>Writing</span>
                                </NavLink>

                                <NavLink
                                    to={`/stories/${storyId}/builder`}
                                    className="sidebar-link"
                                >
                                    <ListTree size={18} />
                                    <span>Story Builder</span>
                                </NavLink>

                                <NavLink
                                    to={`/stories/${storyId}/characters`}
                                    className="sidebar-link"
                                >
                                    <Users size={18} />
                                    <span>Characters</span>
                                </NavLink>

                                <NavLink
                                    to={`/stories/${storyId}/world`}
                                    className="sidebar-link"
                                >
                                    <Globe size={18} />
                                    <span>World Builder</span>
                                </NavLink>


                            </nav>
                        ) : (
                            <nav className="sidebar-navigation">

                                <p className="menu-label">
                                    Workspace
                                </p>

                                <NavLink
                                    to="/dashboard"
                                    end
                                    className="sidebar-link"
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </NavLink>

                                <NavLink
                                    to="/ideas"
                                    className="sidebar-link"
                                >
                                    <Lightbulb size={18} />
                                    <span>Idea Vault</span>
                                </NavLink>

                                <NavLink
                                    to="/stories"
                                    className="sidebar-link"
                                >
                                    <BookOpen size={18} />
                                    <span>My Stories</span>
                                </NavLink>

                            </nav>
                        )}

                        <div className="sidebar-bottom">
                            <button
                                className="sidebar-link logout-button"
                                type="button"
                                onClick={openLogoutModal}
                            >
                                <LogOut size={18} />
                                <span>Log out</span>
                            </button>
                        </div>
                    </>
                )}
            </aside>

            {sidebarCollapsed && (
                <button
                    className="sidebar-open-button"
                    type="button"
                    title="Show sidebar"
                    onClick={toggleSidebar}
                >
                    <PanelLeftOpen size={19} />
                </button>
            )}

            {showLogoutModal && (
                <div className="logout-modal-overlay">
                    <div className="logout-modal">

                        <div className="logout-modal-header">
                            <div className="logout-icon">
                                <LogOut size={20} />
                            </div>

                            <button
                                className="logout-close-button"
                                type="button"
                                onClick={closeLogoutModal}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="logout-modal-content">
                            <p className="logout-modal-eyebrow">
                                LOG OUT
                            </p>

                            <h2>
                                Log out of Inkfollow?
                            </h2>

                            <p>
                                Are you sure you want to log out of your account?
                            </p>
                        </div>

                        <div className="logout-modal-actions">
                            <button
                                className="logout-cancel-button"
                                type="button"
                                onClick={closeLogoutModal}
                            >
                                Cancel
                            </button>

                            <button
                                className="logout-confirm-button"
                                type="button"
                                onClick={confirmLogout}
                            >
                                Log Out
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;