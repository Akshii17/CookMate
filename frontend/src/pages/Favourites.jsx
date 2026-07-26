import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LayoutGrid, List, Search, Heart } from "lucide-react";
import { EmptyPlateArt, ART_MAP } from "../components/Arts";
import { PageShell, PageHero } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { getFavorites, removeFavorite } from "../services/favoritesService";

const ART_KEYS = Object.keys(ART_MAP);

function parseFirstStep(content) {
  if (!content) return "";
  const index = content.indexOf("Instructions:");
  const after = index === -1 ? content : content.slice(index + "Instructions:".length);
  const step = after
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!step) return "";
  return step.replace(/^\d+\.\s*/, "");
}

function apiRecipeToCard(recipe, index) {
  return {
    id: recipe.id,
    title: recipe.title,
    badge: recipe.diet || "Recipe",
    desc: parseFirstStep(recipe.content) || recipe.title,
    time: `${recipe.prep_time} min`,
    tag: recipe.cuisine || "Saved",
    ghost: "#c8b468",
    art: ART_KEYS[index % ART_KEYS.length],
    raw: recipe,
  };
}

function RecipeCard({ recipe, isList, delay, onRemove, onOpen }) {
  const [popping, setPopping] = useState(false);
  const Art = ART_MAP[recipe.art] || ART_MAP.pasta;

  const handleRemove = (e) => {
    e.stopPropagation();
    setPopping(true);
    setTimeout(() => {
      setPopping(false);
      onRemove(recipe.id);
    }, 360);
  };

  const meta = (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center rounded-full bg-[#d8d4c0] px-3 py-1 font-sans text-xs text-[#585e40]">
        ⏱ {recipe.time}
      </span>
      <span className="inline-flex items-center rounded-full bg-[#d8d4c0] px-3 py-1 font-sans text-xs text-[#585e40]">
        {recipe.tag}
      </span>
    </div>
  );

  const openRecipe = () => onOpen(recipe);

  if (isList) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={openRecipe}
        onKeyDown={(e) => e.key === "Enter" && openRecipe()}
        className="animate-card-in relative flex cursor-pointer flex-row items-start gap-4 overflow-hidden rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card p-4 transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-[#b0a888] hover:shadow-[0_16px_40px_rgba(70,62,40,0.11)] sm:p-5"
        style={{ animationDelay: delay }}
      >
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e0dcc8]">
          <Art />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 pr-10">
          <span className="w-fit rounded-full bg-cm-olive-dark px-3 py-1 font-sans text-[10px] font-medium tracking-[1.3px] text-[#f0ede0] uppercase">
            {recipe.badge}
          </span>
          <h2 className="font-display text-lg leading-tight font-bold text-[#282c18]">{recipe.title}</h2>
          <p className="font-sans text-sm font-light leading-relaxed text-[#6c6454]">{recipe.desc}</p>
          {meta}
        </div>
        <button
          type="button"
          className={`absolute top-4 right-4 z-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-cm-card-border bg-[#f0ede0] transition-colors hover:border-[#d0846a] hover:bg-[#ffe8e0] ${popping ? "animate-heart-pop" : ""}`}
          onClick={handleRemove}
          title="Remove from favorites"
        >
          <Heart className="size-4 fill-[#c05038] text-[#c05038]" strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openRecipe}
      onKeyDown={(e) => e.key === "Enter" && openRecipe()}
      className="animate-card-in group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-[#b0a888] hover:shadow-[0_16px_40px_rgba(70,62,40,0.11)]"
      style={{ animationDelay: delay }}
    >
      <span className="w-fit rounded-full bg-cm-olive-dark px-3 py-1 font-sans text-[10px] font-medium tracking-[1.3px] text-[#f0ede0] uppercase">
        {recipe.badge}
      </span>
      <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-[#e0dcc8]">
        <Art />
      </div>
      <h2 className="font-display text-lg leading-tight font-bold text-[#282c18]">{recipe.title}</h2>
      <p className="font-sans text-sm font-light leading-relaxed text-[#6c6454]">{recipe.desc}</p>
      {meta}
      <button
        type="button"
        className={`absolute top-4 right-4 z-2 flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-cm-card-border bg-[#f0ede0] transition-colors hover:border-[#d0846a] hover:bg-[#ffe8e0] ${popping ? "animate-heart-pop" : ""}`}
        onClick={handleRemove}
        title="Remove from favorites"
      >
        <Heart className="size-4 fill-[#c05038] text-[#c05038]" strokeWidth={1.8} />
      </button>
      <div
        className="pointer-events-none absolute -right-3 -bottom-3.5 h-20 w-20 rounded-full opacity-[0.13]"
        style={{ background: recipe.ghost }}
      />
    </div>
  );
}

export default function Favourites() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getFavorites()
      .then((data) => {
        setRecipes((data.recipes || []).map(apiRecipeToCard));
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load favorites");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, authLoading]);

  const handleRemove = (id) => {
    removeFavorite(id)
      .then(() => {
        setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
      })
      .catch((err) => {
        toast.error(err.message || "Failed to remove favorite");
      });
  };

  const handleOpenRecipe = (recipe) => {
    navigate("/recipe/dish", {
      state: {
        openRecipe: true,
        savedRecipe: recipe.raw,
        favorited: true,
      },
    });
  };

  const filtered = recipes
    .filter((r) => activeTab === "All" || r.tag === activeTab)
    .filter((r) => {
      const q = search.toLowerCase();
      return !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
    });

  const isEmpty = !loading && filtered.length === 0;
  const isSearchOrFilter = search.trim() || activeTab !== "All";

  return (
    <PageShell>
      <PageHero
        title={
          <>
            Your <em className="font-display font-semibold text-cm-olive-muted not-italic">Favourites</em>
          </>
        }
        description="All the recipes you've loved, saved in one cozy spot."
      />

      <div className="flex items-center gap-3 rounded-full border-[1.5px] border-[#c4be98] bg-[#dedad0] px-4 py-3">
        <Search className="size-4 shrink-0 text-[#9a9078]" strokeWidth={1.7} />
        <input
          type="text"
          placeholder="Search your saved recipes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border-none bg-transparent font-sans text-sm font-light text-[#38351e] outline-none placeholder:text-[#9a9078]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className={`flex items-center rounded-lg border-[1.5px] border-[#b4ad98] p-2 transition-colors ${
              viewMode === "grid" ? "bg-[#cec8b4] text-[#2a3218]" : "bg-transparent text-[#78735e] hover:bg-[#cec8b4]"
            }`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <LayoutGrid className="size-4 shrink-0" strokeWidth={1.7} />
          </button>
          <button
            type="button"
            className={`flex items-center rounded-lg border-[1.5px] border-[#b4ad98] p-2 transition-colors ${
              viewMode === "list" ? "bg-[#cec8b4] text-[#2a3218]" : "bg-transparent text-[#78735e] hover:bg-[#cec8b4]"
            }`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <List className="size-4 shrink-0" strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {!isEmpty && (
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-bold text-[#282c18]">Saved Recipes</span>
          <span className="rounded-full bg-cm-olive-dark px-3 py-1.5 font-sans text-[10px] font-medium tracking-wide text-[#f0ede0] uppercase">
            {filtered.length} saved
          </span>
        </div>
      )}

      {loading ? (
        <div className="py-14 text-center font-sans text-sm font-light text-[#9a9282]">
          Loading your favorites…
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card px-6 py-14 text-center">
          <EmptyPlateArt />
          <h2 className="mt-6 mb-3 font-display text-xl font-bold text-[#282c18]">
            {!isAuthenticated
              ? "Sign in to save favorites."
              : isSearchOrFilter
                ? "No matches found."
                : "No favorites yet."}
          </h2>
          <p className="max-w-sm font-sans text-sm font-light leading-relaxed text-[#7a7060]">
            {!isAuthenticated
              ? "Log in and tap the heart while cooking to save recipes here."
              : isSearchOrFilter
                ? "Try a different search or filter to find your saved recipes."
                : "Start saving recipes you love and they'll appear here!"}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {filtered.map((r, i) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              isList={viewMode === "list"}
              delay={`${(0.08 + i * 0.06).toFixed(2)}s`}
              onRemove={handleRemove}
              onOpen={handleOpenRecipe}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
