import { useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { PastaArt, VeggieArt, TimerArt } from "../components/Arts";
import { PageShell, PageHero } from "../components/PageShell";

function FeatureCard({ badge, Art, title, desc, btnText, ghostColor, delay, onClick }) {
  return (
    <div
      className="group animate-card-in relative cursor-pointer overflow-hidden rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#b0a888] hover:shadow-[0_16px_40px_rgba(70,62,40,0.11)] sm:p-6"
      style={{ animationDelay: delay }}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
    >
      <span className="mb-4 inline-block rounded-full bg-cm-olive-dark px-3.5 py-1.5 font-sans text-[10px] font-medium tracking-[1.3px] text-[#f0ede0] uppercase">
        {badge}
      </span>

      <div className="mb-4 flex justify-center sm:justify-start">
        <Art className="group-hover:animate-art-wiggle" />
      </div>

      <h2 className="mb-2 font-display text-xl leading-tight font-bold text-[#282c18]">{title}</h2>

      <p className="mb-5 font-sans text-sm font-light leading-relaxed text-[#686358]">{desc}</p>

      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#b0a888] bg-transparent px-5 py-2.5 font-sans text-sm font-normal whitespace-nowrap text-[#38351e] transition-colors hover:border-[#8a8060] hover:bg-[#d8d4c0]"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {btnText}
        <span className="inline-flex group-hover:animate-arrow-slide">
          <ArrowRight className="size-4 shrink-0" strokeWidth={1.7} />
        </span>
      </button>

      <div
        className="pointer-events-none absolute -right-3 -bottom-3.5 h-20 w-20 rounded-full opacity-[0.13] sm:h-[78px] sm:w-[78px]"
        style={{ background: ghostColor }}
      />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      badge: "Explore",
      Art: PastaArt,
      title: "Pick a Dish",
      desc: "Browse recipes by cuisine, mood, or season. Find exactly what you're craving today.",
      btnText: "Explore",
      ghostColor: "#c8b468",
      delay: "0.12s",
      mode: "dish",
    },
    {
      badge: "Smart Cook",
      Art: VeggieArt,
      title: "Use My Ingredients",
      desc: "Tell us what's in your fridge and we'll craft the perfect recipe from what you already have.",
      btnText: "Let's go",
      ghostColor: "#60aa50",
      delay: "0.2s",
      mode: "ingredients",
    },
    {
      badge: "Quick & Easy",
      Art: TimerArt,
      title: "Minute Meals",
      desc: "Recipes ready in 15 minutes or less — for when time is short but taste still matters.",
      btnText: "Quick start",
      ghostColor: "#d4b060",
      delay: "0.28s",
      mode: "quick",
    },
  ];

  return (
    <PageShell>
      <PageHero
        title={
          <>
            Start{" "}
            <em className="font-display font-semibold text-cm-olive-muted not-italic">Cookin&apos;</em>!
          </>
        }
        description="What are we making today? Pick your path and let's get something delicious on the table."
      />

      <div className="flex items-center justify-center gap-3 opacity-50">
        <Leaf className="size-4 shrink-0 text-[#789a56]" strokeWidth={1.5} />
        <div className="h-1 w-1 rounded-full bg-[#8a9c68]" />
        <Sparkles className="size-4 shrink-0 text-[#789a56]" strokeWidth={1.5} />
        <div className="h-1 w-1 rounded-full bg-[#8a9c68]" />
        <Leaf className="size-4 shrink-0 text-[#789a56]" strokeWidth={1.5} />
      </div>

      <div className="page-section-grid">
        {cards.map((c) => (
          <FeatureCard
            key={c.title}
            {...c}
            onClick={() => navigate(`/recipe/${c.mode}`)}
          />
        ))}
      </div>
    </PageShell>
  );
}
