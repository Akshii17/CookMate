import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Recipe from "./pages/Recipe";
import Profile from "./pages/Profile";
import Favourites from "./pages/Favourites";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#edead9",
            color: "#2a3218",
            border: "1.5px solid #cfc8b0",
            borderRadius: "12px",
            padding: "12px 16px",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            fontSize: "14px",
            boxShadow: "0 8px 24px rgba(70, 62, 40, 0.12)",
          },
          success: {
            iconTheme: {
              primary: "#728e50",
              secondary: "#f0ede0",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="home" element={isAuthenticated ? <Home /> : <Navigate to="/" replace />} />
          <Route path="recipe/:mode" element={isAuthenticated ? <Recipe /> : <Navigate to="/" replace />} />
          <Route path="favourites" element={isAuthenticated ? <Favourites /> : <Navigate to="/" replace />} />
          <Route path="profile" element={isAuthenticated ? <Profile /> : <Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
