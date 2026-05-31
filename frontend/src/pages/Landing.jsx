import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Leaf, Mic, ChefHat, Heart, Sparkles, ArrowDown } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import { HeroIllustrations, SparkleScatter, SECTION_SPARKLES, WhySectionDecor, WhyProblemGrid } from "../components/LandingDecor";
import { AuthModal } from "../components/AuthModal";

const FEATURES = [
  {
    icon: Mic,
    title: "Voice-guided cooking",
    desc: "Move through steps with your voice — next, back, or repeat — while your hands stay on the food.",
  },
  {
    icon: ChefHat,
    title: "Recipes your way",
    desc: "Pick a dish, use what’s in your fridge, or ask for quick meals. CookMate adapts to you.",
  },
  {
    icon: Heart,
    title: "Save favourites",
    desc: "Love a recipe? Save it and jump back in anytime from your personal collection.",
  },
  {
    icon: Sparkles,
    title: "Ask as you cook",
    desc: "Stuck on a step? Ask CookMate in plain language and get help in context.",
  },
];


export default function Landing() {
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState(null);

  const openLogin = () => setAuthModal("login");
  const openSignup = () => setAuthModal("signup");
  const closeAuth = () => setAuthModal(null);

  const handleAuthSuccess = (type) => {
    closeAuth();
    navigate("/home");
    toast.success(type === "login" ? "Welcome back!" : "Account created — welcome to CookMate!");
  };

  return (
    <div className="landing-page min-h-screen bg-cm-bg font-sans text-cm-text">
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={closeAuth}
          onSwitchMode={setAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[#d2cebe]/60 bg-cm-bg/85 backdrop-blur-md">
        <div className="flex w-full items-center justify-between px-5 py-3.5 md:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-[#384820]">
            <Leaf className="size-5 shrink-0 text-[#789a56]" strokeWidth={1.5} />
            CookMate
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openLogin}
              className="rounded-full border-[1.5px] border-[#b0a888] bg-transparent px-4 py-2 font-sans text-sm text-[#585e40] transition-colors hover:bg-[#d8d4c0]"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={openSignup}
              className="rounded-full border-[1.5px] border-[#5a7040] bg-cm-olive-dark px-4 py-2 font-sans text-sm text-[#f0ede0] transition-colors hover:bg-[#6a8050]"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-24 pb-20 md:px-8">
        <HeroIllustrations />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="animate-fade-up mb-3 font-sans text-sm font-medium tracking-wide text-cm-olive-muted" style={{ animationDelay: "0.2s" }}>
            Hands busy? Just ask CookMate
          </p>
          <h1
            className="animate-fade-up font-display text-[2.75rem] leading-[1.05] font-bold tracking-tight sm:text-6xl md:text-7xl"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-cm-olive-muted">CookMate</span>
            <span className="mt-2 block text-[0.55em] font-semibold text-cm-text sm:mt-3">
              AI-Powered Voice
              <br className="sm:hidden" /> Cooking Assistant
            </span>
          </h1>
          <p
            className="animate-fade-up mx-auto mt-6 max-w-lg font-sans text-base font-light leading-relaxed text-cm-text-muted sm:text-lg"
            style={{ animationDelay: "0.2s" }}
          >
            Your kitchen companion that talks you through every step — no greasy screens, no lost place in the recipe.
          </p>
          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "0.2s" }}
          >
            <button
              type="button"
              onClick={openSignup}
              className="rounded-full border-[1.5px] border-[#5a7040] bg-cm-olive-dark px-7 py-3 font-sans text-sm font-medium text-[#f0ede0] transition-[transform,background] hover:scale-[1.03] hover:bg-[#6a8050]"
            >
              Start cooking
            </button>
            <a
              href="#features"
              className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#b0a888] bg-transparent px-6 py-3 font-sans text-sm text-[#585e40] transition-colors hover:bg-[#d8d4c0]"
            >
              See features
              <ArrowDown className="size-4 shrink-0" strokeWidth={1.7} />
            </a>
          </div>
        </div>

        <div className="animate-hero-enter absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <a
            href="#features"
            className="animate-bounce-soft block text-[#9a9078]"
            aria-label="Scroll to features"
          >
            <ArrowDown className="size-6" strokeWidth={1.5} />
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32">
        <SparkleScatter sparkles={SECTION_SPARKLES} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#d4dfc4]/25 to-transparent" />
        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <h2 className="mb-3 text-center font-display text-3xl font-bold text-cm-text sm:text-4xl">
              Everything you need at the stove
            </h2>
            <p className="mx-auto mb-14 max-w-xl text-center font-sans text-base font-light text-cm-text-muted">
              CookMate combines voice control, smart recipes, and a calm interface built for real kitchens.
            </p>
          </ScrollReveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="group h-full rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card/90 p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#a8be88] hover:shadow-[0_20px_48px_rgba(70,62,40,0.12)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#d4dfc4] text-cm-olive-muted transition-colors group-hover:bg-cm-olive-dark group-hover:text-[#f0ede0]">
                    <f.icon className="size-5 shrink-0" strokeWidth={1.7} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-[#282c18]">{f.title}</h3>
                  <p className="font-sans text-sm font-light leading-relaxed text-[#6e6858]">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why CookMate */}
      <section id="why" className="relative overflow-hidden px-5 py-20 md:px-8 md:py-28">
        <WhySectionDecor />

        <div className="relative mx-auto max-w-2xl">
          <ScrollReveal>
            <h2 className="mb-10 text-center font-display text-3xl font-bold text-cm-text sm:mb-12 sm:text-4xl md:text-5xl">
              Why use CookMate?
            </h2>
          </ScrollReveal>

          <WhyProblemGrid />

          <ScrollReveal delay={200}>
            <div className="mt-12 text-center sm:mt-14">
              <button
                type="button"
                onClick={openSignup}
                className="rounded-full border-[1.5px] border-[#5a7040] bg-cm-olive-dark px-8 py-3.5 font-sans text-sm font-medium tracking-wide text-[#f0ede0] transition-[transform,background] hover:scale-[1.03] hover:bg-[#6a8050]"
              >
                Get started — it&apos;s free
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-[#d2cebe] px-5 py-8 text-center font-sans text-xs font-light text-[#9a9078]">
        © {new Date().getFullYear()} CookMate · Cook with confidence
      </footer>
    </div>
  );
}
