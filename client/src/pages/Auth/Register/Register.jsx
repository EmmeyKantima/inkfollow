
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PenLine } from "lucide-react";

import API_URL from "../../../api/api";
import "./Register.css";

function Register() {
    var navigate = useNavigate();

    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [confirmPassword, setConfirmPassword] = useState("");

    var [message, setMessage] = useState("");
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            var response = await fetch(
                API_URL + "/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        username: username,
                        email: email,
                        password: password,
                        confirmPassword: confirmPassword
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed.");
                return;
            }

            setMessage("Account created successfully!");

            setTimeout(function () {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error("Register error:", error);
            setError("Unable to connect to the server.");
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
                            Create an Account
                        </h1>
                        <p>
                            Start building your stories with inkfollow.
                        </p>
                    </div>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="auth-form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={function (event) {
                                    setName(event.target.value);
                                }}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={function (event) {
                                    setUsername(event.target.value);
                                }}
                                placeholder="Choose a username"
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={function (event) {
                                    setEmail(event.target.value);
                                }}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={function (event) {
                                    setPassword(event.target.value);
                                }}
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={function (event) {
                                    setConfirmPassword(event.target.value);
                                }}
                                placeholder="Enter your password again"
                                required
                            />
                        </div>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="auth-success">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-button"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Register"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <span>Already have an account?</span>
                        <Link to="/login">Login</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Register;
