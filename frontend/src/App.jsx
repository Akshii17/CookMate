import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Recipe from "./pages/Recipe";
import Profile from "./pages/Profile";
import Favourites from "./pages/Favourites";

export default function App() {
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
          <Route path="home" element={<Home />} />
          <Route path="recipe/:mode" element={<Recipe />} />
          <Route path="favourites" element={<Favourites />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
