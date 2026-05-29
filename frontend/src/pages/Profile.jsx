import { useRef, useState } from "react";
import { User, Leaf, AlertCircle, Pencil, Check, Camera, X } from "lucide-react";
import { AvatarArt } from "../components/Arts";
import { PageShell, PageHero } from "../components/PageShell";

const DIET_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian", emoji: "🥦" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "pescatarian", label: "Pescatarian", emoji: "🐟" },
  { id: "keto", label: "Keto", emoji: "🥑" },
  { id: "paleo", label: "Paleo", emoji: "🍖" },
  { id: "low-carb", label: "Low Carb", emoji: "🥗" },
];

const ALLERGEN_OPTIONS = [
  { id: "gluten", label: "Gluten" },
  { id: "dairy", label: "Dairy" },
  { id: "nuts", label: "Tree Nuts" },
  { id: "peanuts", label: "Peanuts" },
  { id: "soy", label: "Soy" },
  { id: "eggs", label: "Eggs" },
  { id: "shellfish", label: "Shellfish" },
  { id: "sesame", label: "Sesame" },
];

function ToggleChip({ label, emoji, active, onToggle, variant = "diet" }) {
  const isAllergen = variant === "allergen";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex cursor-pointer items-center gap-1 rounded-full border-[1.5px] px-3.5 py-1.5 font-sans text-xs transition-colors select-none ${
        active
          ? isAllergen
            ? "border-[#a06038] bg-[#b87248] text-[#fdf0e8]"
            : "border-[#6a8050] bg-cm-olive-dark text-[#f0ede0]"
          : "border-[#c8c2a8] bg-[#e4e0ce] text-[#6a6454] hover:border-[#b0a888] hover:bg-[#d8d4c0]"
      }`}
    >
      {emoji && <span className="text-[13px]">{emoji}</span>}
      {label}
    </button>
  );
}

export default function Profile() {
  const [saved, setSaved] = useState({
    name: "Aarav Mehta",
    email: "aarav@cookmate.app",
    bio: "Home cook. Spice lover. Always hunting for the perfect biryani.",
    avatar: null,
    diet: new Set(["vegetarian"]),
    allergens: new Set(["gluten", "nuts"]),
  });

  const [draft, setDraft] = useState(null);
  const [saveAnim, setSaveAnim] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const avatarInputRef = useRef(null);

  const isEditing = draft !== null;

  const openEdit = () => {
    setDraft({
      name: saved.name,
      email: saved.email,
      bio: saved.bio,
      avatar: saved.avatar,
      diet: new Set(saved.diet),
      allergens: new Set(saved.allergens),
    });
    setJustSaved(false);
  };

  const cancelEdit = () => setDraft(null);

  const handleSave = () => {
    setSaveAnim(true);
    setTimeout(() => setSaveAnim(false), 350);
    setSaved({
      ...draft,
      diet: new Set(draft.diet),
      allergens: new Set(draft.allergens),
    });
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      setDraft(null);
    }, 1400);
  };

  const toggleDiet = (id) =>
    setDraft((prev) => {
      const d = new Set(prev.diet);
      if (d.has(id)) d.delete(id);
      else d.add(id);
      return { ...prev, diet: d };
    });

  const toggleAllergen = (id) =>
    setDraft((prev) => {
      const a = new Set(prev.allergens);
      if (a.has(id)) a.delete(id);
      else a.add(id);
      return { ...prev, allergens: a };
    });

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      setDraft((prev) => (prev ? { ...prev, avatar: result } : prev));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const data = isEditing ? draft : saved;

  return (
    <PageShell>
      <PageHero
        title={
          <>
            Hello,{" "}
            <em className="font-display font-semibold text-cm-olive-muted not-italic">
              {saved.name.split(" ")[0]}
            </em>
            !
          </>
        }
        description={
          isEditing
            ? "Changes won't apply until you tap Save."
            : "Make CookMate truly yours — your tastes, dietary needs, your story."
        }
      />

      <div className="page-card animate-card-in relative overflow-hidden text-center lg:flex lg:items-center lg:gap-10 lg:text-left">
        <div className="pointer-events-none absolute -right-5 -bottom-5 h-[110px] w-[110px] rounded-full bg-cm-olive opacity-10" />

        <div className="relative mb-3 inline-block shrink-0 lg:mb-0">
          <div className="inline-block h-20 w-20 overflow-hidden rounded-full border-[1.5px] border-[#9db07e] bg-[#d7dfc6] lg:h-24 lg:w-24">
            {data.avatar ? (
              <img src={data.avatar} alt="Profile avatar" className="h-full w-full object-cover" />
            ) : (
              <AvatarArt className="block h-full w-full" />
            )}
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Upload profile photo"
              className="absolute right-[-4px] bottom-0 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#c4be98] bg-[#e0dcc8] text-[#6a6454] transition-colors hover:bg-[#cec8b4] hover:text-[#2a3218]"
            >
              <Camera className="size-[13px] shrink-0" strokeWidth={1.7} />
            </button>
          )}
          {isEditing && (
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          )}
        </div>

        <div className="lg:flex-1">
        <div className="mb-0.5 font-display text-lg font-bold text-cm-text">{saved.name}</div>
        <div className="mb-4 font-sans text-xs font-light text-[#8a8470]">{saved.email}</div>

        <div className="mb-4 flex gap-2 lg:mb-5">
          {[
            { num: "24", lbl: "Saved" },
            { num: "7", lbl: "Cooked" },
            { num: saved.diet.size, lbl: "Prefs" },
          ].map((s) => (
            <div
              key={s.lbl}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-[14px] border-[1.5px] border-[#ccc6ae] bg-[#e4e0ce] px-4.5 py-2.5"
            >
              <span className="font-display text-xl leading-none font-bold text-[#2c2818]">{s.num}</span>
              <span className="font-sans text-[10px] tracking-wide text-[#8a8470] uppercase">{s.lbl}</span>
            </div>
          ))}
        </div>

        {!isEditing && (
          <div className="mt-4 lg:mt-0">
            <button
              type="button"
              onClick={openEdit}
              className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#b0a888] bg-transparent px-4.5 py-2 font-sans text-[12.5px] text-[#585e40] transition-colors hover:border-[#8a8060] hover:bg-[#d8d4c0]"
            >
              <Pencil className="size-[13px] shrink-0" strokeWidth={1.7} /> Edit Profile
            </button>
          </div>
        )}
        </div>
      </div>

      <div className="page-cards-grid">
      <div className="page-card animate-card-in relative overflow-hidden">
        <div className="pointer-events-none absolute -top-4 -right-4 h-20 w-20 rounded-full bg-[#a0b878] opacity-10" />
        <div className="mb-4 inline-flex items-center gap-1.5 font-sans text-[9.5px] font-medium tracking-[1.4px] text-cm-olive-dark uppercase">
          <User className="size-[13px] shrink-0" strokeWidth={1.7} /> Personal Info
        </div>

        {isEditing ? (
          <div className="animate-slide-in flex flex-col gap-3.5">
            <div>
              <label className="mb-1.5 block font-sans text-[11.5px] font-medium tracking-wide text-[#6a6454]">
                Full Name
              </label>
              <input
                className="w-full rounded-xl border-[1.5px] border-[#c8c2a8] bg-[#e4e0ce] px-3.5 py-2.5 font-sans text-[13.5px] text-[#2c2818] outline-none transition-[border-color,background] placeholder:font-light placeholder:text-[#9a9078] focus:border-[#8a9c68] focus:bg-[#dedad0]"
                type="text"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-sans text-[11.5px] font-medium tracking-wide text-[#6a6454]">
                Email
              </label>
              <input
                className="w-full rounded-xl border-[1.5px] border-[#c8c2a8] bg-[#e4e0ce] px-3.5 py-2.5 font-sans text-[13.5px] text-[#2c2818] outline-none transition-[border-color,background] placeholder:font-light placeholder:text-[#9a9078] focus:border-[#8a9c68] focus:bg-[#dedad0]"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-sans text-[11.5px] font-medium tracking-wide text-[#6a6454]">
                A little about you
              </label>
              <textarea
                className="w-full resize-none rounded-xl border-[1.5px] border-[#c8c2a8] bg-[#e4e0ce] px-3.5 py-2.5 font-sans text-[13.5px] leading-relaxed text-[#2c2818] outline-none transition-[border-color,background] placeholder:font-light placeholder:text-[#9a9078] focus:border-[#8a9c68] focus:bg-[#dedad0]"
                rows={3}
                value={draft.bio}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                placeholder="Tell us about your cooking style…"
              />
            </div>
          </div>
        ) : (
          <div className="animate-slide-in flex flex-col gap-4">
            <div>
              <span className="mb-1 block font-sans text-[10.5px] font-medium tracking-wide text-[#9a9078] uppercase">
                Full Name
              </span>
              <span className="font-sans text-[13.5px] leading-snug text-[#2c2818]">{saved.name}</span>
            </div>
            <hr className="border-none border-t-[1.5px] border-[#d8d2bc]" />
            <div>
              <span className="mb-1 block font-sans text-[10.5px] font-medium tracking-wide text-[#9a9078] uppercase">
                Email
              </span>
              <span className="font-sans text-[13.5px] leading-snug text-[#2c2818]">{saved.email}</span>
            </div>
            {saved.bio && (
              <>
                <hr className="border-none border-t-[1.5px] border-[#d8d2bc]" />
                <div>
                  <span className="mb-1 block font-sans text-[10.5px] font-medium tracking-wide text-[#9a9078] uppercase">
                    About
                  </span>
                  <p className="font-sans text-[13px] leading-relaxed font-light text-[#58523e] italic">
                    &quot;{saved.bio}&quot;
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="page-card animate-card-in relative overflow-hidden">
        <div className="pointer-events-none absolute -bottom-5.5 -left-5.5 h-[90px] w-[90px] rounded-full bg-[#789a56] opacity-10" />
        <div className="pointer-events-none absolute -right-5.5 -bottom-10 h-[90px] w-[90px] rounded-full bg-[#c07048] opacity-10" />

        {/* Dietary preferences */}
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 font-sans text-[9.5px] font-medium tracking-[1.4px] text-cm-olive-dark uppercase">
            <Leaf className="size-[13px] shrink-0 text-[#789a56]" strokeWidth={1.5} /> Dietary Preferences
          </div>
          {data.diet.size > 0 && (
            <span className="rounded-full bg-cm-olive-dark px-2.5 py-1 font-sans text-[9.5px] font-medium tracking-wide text-[#f0ede0] uppercase">
              {data.diet.size} selected
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="animate-slide-in">
            <p className="mb-3.5 font-sans text-xs font-light leading-relaxed text-[#7a7060]">
              Select all that apply — we&apos;ll tailor every recipe to your plate.
            </p>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map((opt) => (
                <ToggleChip
                  key={opt.id}
                  {...opt}
                  active={draft.diet.has(opt.id)}
                  onToggle={() => toggleDiet(opt.id)}
                />
              ))}
            </div>
          </div>
        ) : saved.diet.size === 0 ? (
          <p className="animate-slide-in font-sans text-[13px] font-light text-[#9a9078] italic">
            No dietary preferences set.
          </p>
        ) : (
          <div className="animate-slide-in flex flex-wrap gap-2">
            {DIET_OPTIONS.filter((o) => saved.diet.has(o.id)).map((opt) => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[#a8be88] bg-[#c8d8a8] px-3 py-1.5 font-sans text-xs text-[#2c4018] select-none"
              >
                <span className="text-[13px]">{opt.emoji}</span>
                {opt.label}
              </span>
            ))}
          </div>
        )}

        <hr className="my-6 border-none border-t-[1.5px] border-[#d8d2bc]" />

        {/* Allergens to avoid */}
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 font-sans text-[9.5px] font-medium tracking-[1.4px] text-cm-olive-dark uppercase">
            <AlertCircle className="size-[13px] shrink-0" strokeWidth={1.7} /> Allergens to Avoid
          </div>
          {data.allergens.size > 0 && (
            <span className="rounded-full bg-[#b87248] px-2.5 py-1 font-sans text-[9.5px] font-medium tracking-wide text-[#fdf0e8] uppercase">
              {data.allergens.size} flagged
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="animate-slide-in">
            <p className="mb-3.5 font-sans text-xs font-light leading-relaxed text-[#7a7060]">
              Flag anything you&apos;re allergic or sensitive to. We&apos;ll always warn you.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((opt) => (
                <ToggleChip
                  key={opt.id}
                  label={opt.label}
                  active={draft.allergens.has(opt.id)}
                  onToggle={() => toggleAllergen(opt.id)}
                  variant="allergen"
                />
              ))}
            </div>
          </div>
        ) : saved.allergens.size === 0 ? (
          <p className="animate-slide-in font-sans text-[13px] font-light text-[#9a9078] italic">
            No allergens flagged.
          </p>
        ) : (
          <div className="animate-slide-in flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.filter((o) => saved.allergens.has(o.id)).map((opt) => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[#d8a888] bg-[#f0d0b8] px-3 py-1.5 font-sans text-xs text-[#582808] select-none"
              >
                {opt.label}
              </span>
            ))}
          </div>
        )}
      </div>

      </div>

      {isEditing && (
        <div className="animate-slide-in mx-auto flex w-full max-w-xl flex-col gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            className={`flex w-full items-center justify-center gap-2 rounded-full border-none px-6 py-3.5 font-sans text-sm font-medium tracking-wide text-[#f0ede0] transition-[background,transform] active:scale-[0.97] hover:bg-[#6a8050] ${
              saveAnim ? "animate-save-pop" : ""
            } ${justSaved ? "bg-[#5a7040]" : "bg-cm-olive-dark"}`}
          >
            {justSaved ? (
              <>
                <span className="inline-flex animate-check-in">
                  <Check className="size-4 shrink-0" strokeWidth={1.7} />
                </span>{" "}
                Saved!
              </>
            ) : (
              <>
                <Check className="size-4 shrink-0" strokeWidth={1.7} /> Save Changes
              </>
            )}
          </button>

          <button
            type="button"
            onClick={cancelEdit}
            className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#c4be98] bg-transparent px-6 py-3 font-sans text-sm text-[#6a6454] transition-colors hover:bg-[#d8d4c0]"
          >
            <X className="size-[13px] shrink-0" strokeWidth={1.7} /> Cancel
          </button>

          <p className="mt-1 text-center font-sans text-[11.5px] font-light leading-snug text-[#9a9078]">
            Your preferences are stored locally and used only to personalise your recipes.
          </p>
        </div>
      )}
    </PageShell>
  );
}
