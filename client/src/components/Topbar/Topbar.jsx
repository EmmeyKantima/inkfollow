import { UserCircle, ChevronDown } from "lucide-react";

import "./Topbar.css";

function TopBar() {
    var userData = localStorage.getItem("inkspireUser");

    var user = userData
        ? JSON.parse(userData)
        : null;

    return (
        <header className="top-bar">

            <div className="top-bar-spacer"></div>

            <button className="profile-button">

                <UserCircle size={25} />

                <div className="profile-info">

                    <strong>
                        {user
                            ? user.name
                            : "Writer"}
                    </strong>

                    <span>
                        {user
                            ? "@" + user.username
                            : "Writer"}
                    </span>

                </div>
               
            </button>

        </header>
    );
}

export default TopBar;