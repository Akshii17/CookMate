import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Recipe from "./pages/Recipe";
import Profile from "./pages/Profile";
import Favourites from "./pages/Favourites";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="recipe/:mode" element={<Recipe />} />
          <Route path="favourites" element={<Favourites />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
