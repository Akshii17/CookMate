import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getDummyRecipe } from "../lib/recipeData";
import {
  Send,
  Leaf,
  Mic,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Heart,
  Clock,
  MessageCircle,
  X,
} from "lucide-react";
import { PageShell, PageChip, PageHero } from "../components/PageShell";

const MODE_CONFIG = {
  dish: {
    label: "Pick a Dish",
    placeholder: "Enter a dish name...",
    hint: "e.g. Pasta Carbonara, Butter Chicken, Avocado Toast",
    suggestions: ["Pasta Carbonara", "Butter Chicken", "Avocado Toast", "Ramen", "Tacos"],
  },
  ingredients: {
    label: "Use My Ingredients",
    placeholder: "Enter ingredients you have...",
    hint: "e.g. chicken, garlic, lemon, spinach",
    suggestions: ["Chicken + Garlic", "Eggs + Cheese", "Rice + Veggies", "Pasta + Tomatoes"],
  },
  quick: {
    label: "Minute Meals",
    placeholder: "Enter time or a quick idea...",
    hint: "e.g. 15 min, something with noodles, easy breakfast",
    suggestions: ["15-min dinner", "5-ingredient meal", "No-cook lunch", "Quick stir fry"],
  },
};

function WaveForm({ active }) {
  return (
    <div className="flex h-7 items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={`wave-bar${active ? " go" : ""}`} />
      ))}
    </div>
  );
}

function RecipeStepView({ recipe, query, onBack, initialFavorited = false }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [heartPop, setHeartPop] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [queryReply, setQueryReply] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const stepRef = useRef(null);

  const totalSteps = recipe.steps.length;

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const repeatStep = useCallback(() => {
    if (stepRef.current) {
      stepRef.current.classList.remove("animate-slide-in");
      void stepRef.current.offsetWidth;
      stepRef.current.classList.add("animate-slide-in");
    }
  }, []);

  const handleVoiceCommand = useCallback(
    (transcript) => {
      const t = transcript.toLowerCase();
      if (t.includes("next")) goNext();
      else if (t.includes("prev") || t.includes("back") || t.includes("previous")) goPrev();
      else if (t.includes("repeat")) repeatStep();
    },
    [goNext, goPrev, repeatStep]
  );

  useEffect(() => {
    if (!listening) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleVoiceCommand(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    return () => recognition.abort();
  }, [listening, handleVoiceCommand]);

  const handleAskQuery = () => {
    if (!queryText.trim() || queryLoading) return;
    const question = queryText.trim();
    setQueryLoading(true);

    fetch("http://127.0.0.1:8000/ask-question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipe: {
          title: recipe.name,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
        },
        current_step_text: recipe.steps[stepIndex],
        step_number: stepIndex + 1,
        total_steps: totalSteps,
        question,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Request failed");
        }
        return res.json();
      })
      .then((data) => {
        if (data.status === "success" && data.answer) {
          setQueryReply(data.answer);
        } else {
          setQueryReply("Sorry, I couldn't answer that right now. Please try again.");
        }
        setQueryText("");
      })
      .catch(() => {
        setQueryReply("Sorry, I couldn't reach the server. Please try again.");
        setQueryText("");
      })
      .finally(() => {
        setQueryLoading(false);
      });
  };

  const toggleFavorite = () => {
    setFavorited((f) => !f);
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 380);
  };

  const displayName = recipe.name.replace(/\s+Recipe$/i, "");

  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [stepIndex]);

  return (
    <div className="animate-slide-in flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 space-y-2 pb-2">
        <div className="relative">
          <PageHero
            className="!space-y-1 !border-b-0 !pb-0"
            title={displayName}
            description={
              <>
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Clock className="size-3.5 shrink-0 text-[#789a56]" strokeWidth={1.7} />
                  Prep: {recipe.prepTime} min
                </span>
                <span className="mx-2 text-[#c4be98]">·</span>
                {stepIndex + 1} of {totalSteps}
              </>
            }
          />
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            className={`absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] transition-colors ${
              favorited
                ? "border-[#d0846a] bg-[#ffe8e0]"
                : "border-cm-card-border bg-[#f0ede0] hover:border-[#d0846a] hover:bg-[#ffe8e0]"
            } ${heartPop ? "animate-heart-pop" : ""}`}
          >
            <Heart
              className={`size-4 shrink-0 ${favorited ? "fill-[#c05038] text-[#c05038]" : "text-[#8a8470]"}`}
              strokeWidth={1.8}
            />
          </button>
        </div>

        <div className="page-card !p-3 sm:!p-4">
          <h3 className="mb-1 font-sans text-[10px] font-medium tracking-wide text-[#9a9078] uppercase">
            Ingredients
          </h3>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing}
                className="inline-flex items-center gap-1.5 whitespace-nowrap font-sans text-[11.5px] leading-none text-[#58523e]"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-cm-olive" />
                {ing}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="page-card mt-2 flex min-h-0 flex-1 flex-col overflow-hidden !p-3 sm:!p-4">
        <h3 className="mb-1.5 shrink-0 font-sans text-[10.5px] font-medium tracking-wide text-[#9a9078] uppercase">
          Steps
        </h3>
        <ol className="min-h-0 flex-1 space-y-0 overflow-y-auto pr-1">
          {recipe.steps.map((step, i) => {
            const isCurrent = i === stepIndex;
            const stepNum = String(i + 1).padStart(2, "0");
            return (
              <li
                key={i}
                ref={isCurrent ? stepRef : null}
                onClick={() => setStepIndex(i)}
                className={`flex cursor-pointer gap-3 border-b border-[#d8d2bc]/80 py-3 transition-colors last:border-b-0 ${
                  isCurrent ? "border-l-[3px] border-l-cm-olive bg-[#d4dfc4]/55 pl-3 -ml-1" : ""
                }`}
              >
                <span
                  className={`shrink-0 font-display text-2xl leading-none font-bold tabular-nums ${
                    isCurrent ? "text-cm-olive-muted" : "text-[#8a9c68]"
                  }`}
                  aria-hidden
                >
                  {stepNum}
                </span>
                <p
                  className={`pt-0.5 font-sans text-[13.5px] leading-relaxed ${
                    isCurrent ? "font-normal text-[#2c2818]" : "font-light text-[#58523e]"
                  }`}
                >
                  {step}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-2 shrink-0 border-t border-[#d2cebe] bg-cm-bg pt-2 pb-0.5">
        {queryReply && (
          <div className="relative mb-1.5 max-h-12 overflow-y-auto rounded-lg border-[1.5px] border-[#c8c2a8] bg-[#e4e0ce] px-3.5 py-2.5 pr-7 font-sans text-[13.5px] leading-snug text-[#58523e]">
            <p>{queryReply}</p>
            <button
              type="button"
              onClick={() => setQueryReply(null)}
              aria-label="Dismiss reply"
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-[#78735e] transition-colors hover:bg-[#d8d4c0] hover:text-[#2c2818]"
            >
              <X className="size-3 shrink-0" strokeWidth={2} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border-[1.5px] border-[#c8c2a8] bg-[#edead9] py-1 pl-3 pr-1">
            <MessageCircle className="size-3.5 shrink-0 text-[#789a56]" strokeWidth={1.7} />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskQuery()}
              placeholder={queryLoading ? "Thinking…" : "Ask about this step…"}
              disabled={queryLoading}
              className="min-w-0 flex-1 border-none bg-transparent py-1.5 font-sans text-[13.5px] text-[#2c2818] outline-none placeholder:font-light placeholder:text-[#9a9078] disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleAskQuery}
              disabled={!queryText.trim() || queryLoading}
              aria-label="Send question"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-none bg-cm-olive transition-[background,transform] enabled:hover:bg-[#5a7840] disabled:bg-[#c8c2ae]"
            >
              <Send className="size-3.5 shrink-0 text-[#f0ede0]" strokeWidth={1.7} />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={stepIndex === 0}
              aria-label="Previous step"
              className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[#b0a888] bg-[#edead9] text-[#585e40] transition-colors enabled:hover:bg-[#d8d4c0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4 shrink-0" strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={repeatStep}
              aria-label="Repeat step"
              className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[#b0a888] bg-[#edead9] text-[#585e40] transition-colors hover:bg-[#d8d4c0]"
            >
              <RotateCcw className="size-3.5 shrink-0" strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={stepIndex === totalSteps - 1}
              aria-label="Next step"
              className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[#5a7040] bg-cm-olive-dark text-[#f0ede0] transition-colors enabled:hover:bg-[#6a8050] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-4 shrink-0" strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={() => setListening((l) => !l)}
              aria-label={listening ? "Stop listening" : "Voice commands"}
              title={listening ? "Listening…" : "Tap to speak"}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full border-none transition-[background,transform] hover:scale-105 ${
                listening
                  ? "animate-[mic-throb_0.8s_ease-in-out_infinite] bg-cm-danger"
                  : "bg-cm-olive hover:bg-[#5a7840]"
              }`}
            >
              {listening ? (
                <WaveForm active />
              ) : (
                <Mic className="size-4 shrink-0 text-[#f0ede0]" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseSteps(content) {
  if (!content) return [];
  const index = content.indexOf("Instructions:");
  if (index === -1) return [];
  const afterInstructions = content.slice(index + "Instructions:".length);
  return afterInstructions
    .split("\n")
    .map(step => step.trim())
    .filter(step => step.length > 0)
    .map(step => step.replace(/^\d+\.\s*/, ""));
}

export default function Recipe() {
  const { mode: modeParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = MODE_CONFIG[modeParam] ? modeParam : "dish";

  const navState = location.state;
  const openedFromSaved =
    Boolean(navState?.openRecipe) && Boolean(navState?.recipeTitle);
  const [text, setText] = useState(navState?.recipeTitle ?? "");
  const [listening, setListening] = useState(false);
  const [phase, setPhase] = useState(openedFromSaved ? "cooking" : "search");
  const [recipe, setRecipe] = useState(
    openedFromSaved
      ? getDummyRecipe(navState.recipeTitle, navState.prepTime ?? 50)
      : null
  );
  const [initialFavorited] = useState(Boolean(navState?.favorited));
  const [recipes, setRecipes] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [currentMode, setCurrentMode] = useState(initialMode);

  // Modification state
  const [modText, setModText] = useState("");
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError] = useState(null);
  const inputRef = useRef(null);
  const prevModeRef = useRef(currentMode);

  const cfg = MODE_CONFIG[currentMode] || MODE_CONFIG.dish;

  useEffect(() => {
    if (MODE_CONFIG[modeParam]) setCurrentMode(modeParam);
  }, [modeParam]);

  useEffect(() => {
    if (openedFromSaved) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setModText("");
    setModError(null);
    setModLoading(false);
  }, [selectedRecipe]);

  useEffect(() => {
    if (phase === "search") {
      const t = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (prevModeRef.current === currentMode) return;
    prevModeRef.current = currentMode;
    setText("");
    setPhase("search");
    setRecipe(null);
    setRecipes(null);
    setSelectedRecipe(null);
    setError(null);
    inputRef.current?.focus();
  }, [currentMode]);

  useEffect(() => {
    if (phase !== "cooking") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const handleInput = (e) => {
    const val = e.target.value;
    setText(val);
    if (!val.trim()) {
      setRecipes(null);
      setSelectedRecipe(null);
      setError(null);
    }
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSubmit = () => {
    if (!text.trim()) return;

    setPhase("loading");
    setError(null);
    setRecipes(null);
    setSelectedRecipe(null);

    let max_prep_time;
    if (currentMode === "quick") {
      let match = text.match(/^\s*(\d+)\s*$/);
      if (!match) {
        match = text.match(/\b(\d+)\s*(?:-?\s*min|minute|m\b)/i);
      }
      if (match) {
        max_prep_time = parseInt(match[1], 10);
      }
    }

    const body = { query: text };
    if (max_prep_time !== undefined) {
      body.max_prep_time = max_prep_time;
    }

    fetch("http://127.0.0.1:8000/get-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch recipes. Please try again.");
        }
        return res.json();
      })
      .then((data) => {
        setRecipes(data.recipes || []);
        setPhase("search");
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch recipes. Please try again.");
        setPhase("search");
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleModifyRecipe = () => {
    if (!modText.trim() || modLoading || !selectedRecipe) return;
    setModLoading(true);
    setModError(null);

    fetch("http://127.0.0.1:8000/modify-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipe: selectedRecipe,
        request: modText.trim(),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to modify recipe. Please try again.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.status === "success" && data.recipe) {
          setSelectedRecipe(data.recipe);
          setModText("");
        } else {
          throw new Error("Failed to modify recipe.");
        }
      })
      .catch((err) => {
        setModError(err.message || "Failed to modify recipe. Please try again.");
      })
      .finally(() => {
        setModLoading(false);
      });
  };

  const handleModeChange = (key) => {
    setCurrentMode(key);
    navigate(`/recipe/${key}`, { replace: true });
  };

  const handleBackToSearch = () => {
    setPhase("search");
    setRecipe(null);
  };

  const handleStartRecipe = () => {
    if (!selectedRecipe) return;
    const steps = parseSteps(selectedRecipe.content);
    setRecipe({
      name: selectedRecipe.title,
      prepTime: selectedRecipe.prep_time,
      ingredients: selectedRecipe.ingredients,
      steps,
    });
    setPhase("cooking");
  };

  if (phase === "cooking" && recipe) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <PageShell className="mx-auto flex h-full min-h-0 max-w-2xl flex-1 flex-col overflow-hidden !space-y-0 !px-4 !pt-10 !pb-5 sm:!px-5">
          <RecipeStepView
            recipe={recipe}
            query={text}
            onBack={handleBackToSearch}
            initialFavorited={initialFavorited}
          />
        </PageShell>
      </div>
    );
  }

  return (
    <PageShell className="mx-auto max-w-xl space-y-8">
      <div className="flex flex-wrap justify-center gap-2">
        {Object.entries(MODE_CONFIG).map(([key, c]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleModeChange(key)}
            className={`inline-flex items-center rounded-full border-[1.5px] px-4 py-2 font-sans text-sm tracking-wide whitespace-nowrap transition-colors ${
              currentMode === key
                ? "border-[#5a7040] bg-cm-olive-dark text-[#f0ede0]"
                : "border-[#c0ba9e] bg-transparent text-[#78735e] hover:border-[#a8a28a] hover:bg-[#d8d4c0]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <header className="space-y-3 text-center">
        <h1 className="page-title">
          What do you want to{" "}
          <em className="font-display font-semibold text-cm-olive-muted not-italic">cook</em> today?
        </h1>
        <p className="page-desc mx-auto">{cfg.hint}</p>
      </header>

      <div className="space-y-6">
        <div
          className={`flex items-end gap-3 rounded-[20px] border-[1.5px] bg-cm-input-bg px-4 py-4 transition-[border-color,box-shadow] sm:px-5 ${
            text ? "border-[#a0a87a] shadow-[0_0_0_3px_rgba(120,143,88,0.10)]" : "border-[#ccc6b0]"
          }`}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={cfg.placeholder}
            disabled={phase === "loading"}
            className="max-h-[120px] min-h-7 w-full resize-none overflow-y-hidden border-none bg-transparent font-sans text-base font-light leading-relaxed text-[#2c2e1e] outline-none placeholder:text-[#a8a28e] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || phase === "loading"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none bg-cm-olive transition-[background,transform] enabled:hover:scale-[1.08] enabled:hover:bg-[#5a7840] disabled:cursor-default disabled:bg-[#c8c2ae] disabled:transform-none"
          >
            <Send className="size-4 shrink-0 text-[#f0ede0]" strokeWidth={1.7} />
          </button>
        </div>

        {phase === "search" && (
          <>
            {error && (
              <div className="rounded-[20px] border-[1.5px] border-red-200 bg-red-50 p-4 text-center">
                <p className="font-sans text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {(currentMode === "dish" || currentMode === "ingredients" || currentMode === "quick") && recipes !== null ? (
              selectedRecipe ? (
                <div className="animate-slide-in space-y-4 rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card p-6">
                  <div className="flex items-center justify-between border-b border-[#d8d2bc]/80 pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRecipe(null)}
                      className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-[#789a56] hover:text-[#5a7840] transition-colors"
                    >
                      <ChevronLeft className="size-4 shrink-0" strokeWidth={2} />
                      Back to results
                    </button>
                    <span className="rounded-full bg-[#d4dfc4]/55 px-2.5 py-0.5 font-sans text-[11px] font-medium text-cm-olive-muted uppercase">
                      {selectedRecipe.diet}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <h2 className="font-display text-2xl font-bold text-[#2e3818]">
                        {selectedRecipe.title}
                      </h2>
                      <button
                        type="button"
                        onClick={handleStartRecipe}
                        className="inline-flex items-center rounded-full border-[1.5px] border-[#5a7040] bg-cm-olive-dark px-4 py-1.5 font-sans text-xs font-semibold text-[#f0ede0] hover:bg-[#6a8050] transition-colors whitespace-nowrap ml-4"
                      >
                        Start Recipe
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-light text-[#7a7462]">
                      <span>Cuisine: <strong className="font-medium text-[#5a5648]">{selectedRecipe.cuisine}</strong></span>
                      <span>·</span>
                      <span>Prep Time: <strong className="font-medium text-[#5a5648]">{selectedRecipe.prep_time} mins</strong></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-sans text-[10.5px] font-medium tracking-wide text-[#9a9078] uppercase">
                      Ingredients
                    </h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {selectedRecipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="font-sans text-xs text-[#58523e]">
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 border-t border-[#d8d2bc]/80 pt-4">
                    <h4 className="font-sans text-[10.5px] font-medium tracking-wide text-[#9a9078] uppercase">
                      Instructions
                    </h4>
                    <ol className="list-decimal pl-4 space-y-2.5">
                      {parseSteps(selectedRecipe.content).map((step, idx) => (
                        <li key={idx} className="font-sans text-xs leading-relaxed text-[#58523e]">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Modification Chat Input */}
                  <div className="space-y-2 border-t border-[#d8d2bc]/80 pt-4">
                    <h4 className="font-sans text-[10.5px] font-medium tracking-wide text-[#9a9078] uppercase">
                      Request Modifications
                    </h4>
                    {modError && (
                      <p className="font-sans text-xs font-medium text-red-800 bg-red-50 p-2 rounded-lg border border-red-100">
                        {modError}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border-[1.5px] border-[#c8c2a8] bg-[#edead9] py-1 pl-3 pr-1">
                        <MessageCircle className="size-3.5 shrink-0 text-[#789a56]" strokeWidth={1.7} />
                        <input
                          type="text"
                          value={modText}
                          onChange={(e) => setModText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleModifyRecipe()}
                          placeholder={modLoading ? "Modifying recipe..." : "Ask to swap ingredients, scale, etc..."}
                          disabled={modLoading}
                          className="min-w-0 flex-1 border-none bg-transparent py-1.5 font-sans text-[12.5px] text-[#2c2818] outline-none placeholder:font-light placeholder:text-[#9a9078] disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={handleModifyRecipe}
                          disabled={!modText.trim() || modLoading}
                          aria-label="Send modification request"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-none bg-cm-olive transition-[background,transform] enabled:hover:bg-[#5a7840] disabled:bg-[#c8c2ae]"
                        >
                          <Send className="size-3.5 shrink-0 text-[#f0ede0]" strokeWidth={1.7} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : recipes.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-center font-sans text-xs font-medium tracking-wide text-[#9a9282] uppercase">
                    Select a Recipe
                  </h3>
                  <div className="flex flex-col gap-2">
                    {recipes.map((r, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedRecipe(r)}
                        className="w-full text-left rounded-xl border-[1.5px] border-[#c8c2a8] bg-[#edeadb] px-4 py-3 font-sans text-sm text-[#5a5648] hover:border-[#a8a28a] hover:bg-[#d8d4c0] transition-colors"
                      >
                        {r.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="font-sans text-sm text-[#9a9282]">No recipe found</p>
                </div>
              )
            ) : (
              <>
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="relative h-[88px] w-[88px]">
                    <div className="mic-ring" style={{ opacity: listening ? 0.55 : 0.28 }} />
                    <div className="mic-ring" style={{ opacity: listening ? 0.55 : 0.18 }} />
                    <div className="mic-ring" style={{ opacity: listening ? 0.55 : 0.1 }} />

                    <button
                      type="button"
                      onClick={() => setListening((l) => !l)}
                      className={`relative flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full border-none transition-[background,transform] outline-none hover:scale-105 hover:bg-[#5a7840] ${
                        listening
                          ? "animate-[mic-throb_0.8s_ease-in-out_infinite] bg-cm-danger hover:bg-cm-danger"
                          : "bg-cm-olive"
                      }`}
                    >
                      {listening ? (
                        <WaveForm active />
                      ) : (
                        <Mic className="size-7 shrink-0 text-[#f0ede0]" strokeWidth={1.8} />
                      )}
                    </button>
                  </div>

                  <p
                    className={`font-sans text-sm font-light transition-colors ${
                      listening ? "text-cm-danger" : "text-[#9a9282]"
                    }`}
                  >
                    {listening ? "Listening… tap to stop" : "Tap to speak"}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-center font-sans text-xs font-medium tracking-wide text-[#9a9282] uppercase">
                    Try one of these
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {cfg.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setText(s);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="inline-flex items-center rounded-full border-[1.5px] border-[#c8c2a8] bg-[#edeadb] px-4 py-2 font-sans text-sm text-[#5a5648] transition-[background,border-color,transform] hover:-translate-y-0.5 hover:border-[#a8a28a] hover:bg-[#d8d4c0]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {phase === "loading" && (
          <div className="animate-slide-in space-y-4 rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#b8c89a]">
              <Leaf className="size-7 shrink-0 text-[#2e4018]" strokeWidth={1.8} />
            </div>
            <p className="font-display text-xl font-bold text-[#2e3818]">Finding your recipe…</p>
            <p className="font-sans text-sm font-light leading-relaxed text-[#7a7462]">
              Looking up <em className="text-cm-olive-muted not-italic">&quot;{text}&quot;</em>
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
