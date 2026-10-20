import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PenLine } from "lucide-react";

import API_URL from "../../../api/api";

import "./Login.css";

function Login() {
    var navigate = useNavigate();

    var [login, setLogin] = useState("");
    var [password, setPassword] = useState("");

    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            var response = await fetch(
                API_URL + "/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        login: login,
                        password: password
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "Login failed."
                );

                setLoading(false);
                return;
            }

            localStorage.setItem(
                "inkspireToken",
                data.token
            );

            localStorage.setItem(
                "inkspireUser",
                JSON.stringify(data.user)
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">

            <div className="auth-container">

                <div className="auth-brand">
                    <div className="auth-logo">
                        <PenLine size={22} />
                    </div>

                    <span>INKFOLLOW</span>
                </div>

                <div className="auth-card">

                    <div className="auth-header">

                        <h1>
                            Login
                        </h1>

                    </div>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="auth-form-group">
                            <label>
                                Email or Username
                            </label>

                            <input
                                type="text"
                                value={login}
                                onChange={function (
                                    event
                                ) {
                                    setLogin(
                                        event.target.value
                                    );
                                }}
                                placeholder="Enter your email or username"
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={function (
                                    event
                                ) {
                                    setPassword(
                                        event.target.value
                                    );
                                }}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    <div className="auth-footer">
                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create an account
                        </Link>
                    </div>

                </div>


            </div>

        </div>
    );
}

export default Login;