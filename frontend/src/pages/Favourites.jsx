import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Search, Heart } from "lucide-react";
import { EmptyPlateArt, ART_MAP } from "../components/Arts";
import { PageShell, PageHero } from "../components/PageShell";

const RECIPES = [
  { id: 1, title: "Spaghetti Bolognese", badge: "Pasta", desc: "Rich slow-cooked tomato ragu with herbs & parmesan. Pure comfort.", time: "40 min", tag: "Italian", ghost: "#c8b468", art: "pasta" },
  { id: 2, title: "Green Buddha Bowl", badge: "Vegan", desc: "Roasted veggies, chickpeas & tahini over fluffy quinoa.", time: "25 min", tag: "Healthy", ghost: "#60aa50", art: "bowl" },
  { id: 3, title: "Lemon Herb Salmon", badge: "Seafood", desc: "Pan-seared fillet with garlic butter, lemon zest & fresh dill.", time: "18 min", tag: "Quick", ghost: "#d4b060", art: "fish" },
  { id: 4, title: "Shakshuka", badge: "Breakfast", desc: "Poached eggs in spiced tomato pepper sauce. A morning ritual.", time: "20 min", tag: "Middle Eastern", ghost: "#c06040", art: "eggs" },
  { id: 5, title: "Mango Chia Pudding", badge: "Dessert", desc: "Creamy overnight chia with ripe mango & coconut milk.", time: "5 min", tag: "Sweet", ghost: "#e0a830", art: "pudding" },
  { id: 6, title: "Mushroom Risotto", badge: "Vegetarian", desc: "Silky arborio with wild mushrooms, white wine & parmesan.", time: "35 min", tag: "Italian", ghost: "#a87840", art: "risotto" },
];



function parsePrepMinutes(timeStr) {
  const n = parseInt(timeStr, 10);
  return Number.isNaN(n) ? 50 : n;
}

function RecipeCard({ recipe, isList, delay, onRemove, onOpen }) {
  const [popping, setPopping] = useState(false);
  const Art = ART_MAP[recipe.art];

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
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState(new Set(RECIPES.map((r) => r.id)));

  const handleRemove = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleOpenRecipe = (recipe) => {
    navigate("/recipe/dish", {
      state: {
        openRecipe: true,
        recipeTitle: recipe.title,
        prepTime: parsePrepMinutes(recipe.time),
        favorited: true,
      },
    });
  };

  const filtered = RECIPES.filter((r) => favorites.has(r.id))
    .filter((r) => activeTab === "All" || r.tag === activeTab)
    .filter((r) => {
      const q = search.toLowerCase();
      return !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
    });

  const isEmpty = filtered.length === 0;
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

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card px-6 py-14 text-center">
          <EmptyPlateArt />
          <h2 className="mt-6 mb-3 font-display text-xl font-bold text-[#282c18]">
            {isSearchOrFilter ? "No matches found." : "No favorites yet."}
          </h2>
          <p className="max-w-sm font-sans text-sm font-light leading-relaxed text-[#7a7060]">
            {isSearchOrFilter
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
