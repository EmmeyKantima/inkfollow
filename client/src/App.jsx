import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import MainLayout from "./components/MainLayout/MainLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Ideas from "./pages/Ideas/Ideas";
import Stories from "./pages/Stories/Stories";

import StoryOverview from "./pages/Stories/StoryOverview/StoryOverview";
import StoryCharacters from "./pages/Stories/StoryCharacters/StoryCharacters";
import StoryBuilder from "./pages/Stories/StoryBuilder/StoryBuilder";
import StoryWorld from "./pages/Stories/StoryWorld/StoryWorld";
import StoryWriting from "./pages/Stories/StoryWriting/StoryWriting";

import "./App.css";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Authentication pages */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Default page */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                {/* Protected application */}

                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Dashboard */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


                    {/* Idea Vault */}

                    <Route
                        path="/ideas"
                        element={<Ideas />}
                    />


                    {/* My Stories */}

                    <Route
                        path="/stories"
                        element={<Stories />}
                    />


                    {/* Story Pages */}

                    <Route
                        path="/stories/:storyId"
                        element={<StoryOverview />}
                    />

                    <Route
                        path="/stories/:storyId/characters"
                        element={<StoryCharacters />}
                    />


                    <Route
                        path="/stories/:storyId/builder"
                        element={<StoryBuilder />}
                    />

                    <Route
                        path="/stories/:storyId/world"
                        element={<StoryWorld />}
                    />

                    <Route
                        path="/stories/:storyId/writing"
                        element={<StoryWriting />}
                    />


                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;