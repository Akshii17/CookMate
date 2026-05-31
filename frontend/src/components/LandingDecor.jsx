import tomatoImg from "../../assets/tomato.png";
import capsicumImg from "../../assets/capsicum.png";
import panImg from "../../assets/pan.png";
import touchImg from "../../assets/touch.png";
import confuseImg from "../../assets/confuse.png";
import happyImg from "../../assets/happy.png";
import { ScrollReveal } from "./ScrollReveal";

export function Sparkle({ className = "", style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M10 1l1.2 4.8L16 7l-4.8 1.2L10 13l-1.2-4.8L4 7l4.8-1.2L10 1z"
        fill="#9cb872"
      />
    </svg>
  );
}

const SPARKLE_BASE = "animate-sparkle pointer-events-none absolute";

const HERO_SPARKLES = [
  // Bottom-left cluster — below tomato, near team credit
  {
    className: "bottom-[10%] left-[24%] size-12 opacity-60 sm:left-[26%] md:size-14",
    delay: 0,
    duration: 2.4,
    twirl: -18,
  },
  {
    className: "bottom-[16%] left-[33%] size-8 opacity-55 sm:left-[35%] md:size-9",
    delay: 1.2,
    duration: 3.6,
    twirl: 12,
  },
  {
    className: "bottom-[21%] left-[27%] size-4 opacity-45 sm:left-[29%]",
    delay: 2.1,
    duration: 4.1,
    twirl: -30,
  },
  // Top-right cluster — above capsicum
  {
    className: "top-[37%] right-[15%] size-16 opacity-65 sm:right-[17%] md:size-20",
    delay: 0.7,
    duration: 3.2,
    twirl: 24,
  },
  {
    className: "top-[33%] right-[24%] size-9 opacity-55 sm:right-[26%]",
    delay: 1.9,
    duration: 2.8,
    twirl: -12,
  },
  {
    className: "top-[29%] right-[18%] size-8 opacity-50 sm:right-[20%]",
    delay: 0.4,
    duration: 4.4,
    twirl: 18,
  },
  {
    className: "top-[47%] right-[10%] size-4 opacity-45 sm:right-[12%]",
    delay: 2.8,
    duration: 3.5,
    twirl: -40,
  },
  // Bottom center — above scroll arrow
  {
    className: "bottom-[9%] left-1/2 size-3 -translate-x-1/2 opacity-40",
    delay: 1.5,
    duration: 3.9,
    twirl: 8,
  },
];

const SECTION_SPARKLES = [
  {
    className: "top-[8%] left-[7%] size-10 opacity-45",
    delay: 0.3,
    duration: 3.1,
    twirl: -15,
  },
  {
    className: "top-[22%] right-[9%] size-12 opacity-50",
    delay: 2.1,
    duration: 4.2,
    twirl: 30,
  },
  {
    className: "bottom-[10%] left-[11%] size-8 opacity-40",
    delay: 1.4,
    duration: 2.7,
    twirl: 50,
  },
];

export function SparkleScatter({ sparkles = HERO_SPARKLES }) {
  return (
    <>
      {sparkles.map((sparkle, i) => (
        <Sparkle
          key={i}
          className={`${SPARKLE_BASE} ${sparkle.className}`}
          style={{
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
            "--sparkle-twirl": `${sparkle.twirl}deg`,
          }}
        />
      ))}
    </>
  );
}

export function HeroIllustrations() {
  return (
    <>
      <div
        className="animate-fade-in-left pointer-events-none absolute top-[34%] left-0 z-[1] block w-[min(68vw,280px)] sm:w-[260px] md:w-[340px] lg:w-[400px] xl:left-[2%] xl:w-[440px]"
      >
        <img
          src={tomatoImg}
          alt=""
          aria-hidden
          className="block w-full max-w-none -translate-y-[42%] select-none opacity-75 md:opacity-100"
        />
      </div>
      <div
        className="animate-fade-in-right pointer-events-none absolute top-[71%] right-0 z-[1] block w-[min(72vw,300px)] sm:w-[280px] md:w-[360px] lg:w-[420px] xl:right-[2%] xl:w-[480px]"
      >
        <img
          src={capsicumImg}
          alt=""
          aria-hidden
          className="block w-full max-w-none -translate-y-1/2 select-none opacity-75 md:opacity-100"
        />
      </div>
      <div className="animate-hero-enter pointer-events-none absolute inset-0">
        <SparkleScatter sparkles={HERO_SPARKLES} />
      </div>
    </>
  );
}

export { SECTION_SPARKLES };

export function HerbSprig({ className = "" }) {
  return (
    <svg className={className} width="48" height="72" viewBox="0 0 48 72" fill="none" aria-hidden>
      <path
        d="M24 68V28M24 28C18 22 8 18 6 8c8 2 14 8 18 20M24 28c6-6 16-10 18-20-8 2-14 8-18 20"
        stroke="#5a8a40"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <ellipse cx="14" cy="14" rx="5" ry="8" fill="#6a9a50" opacity="0.45" transform="rotate(-25 14 14)" />
      <ellipse cx="34" cy="12" rx="4" ry="7" fill="#7aaa58" opacity="0.4" transform="rotate(20 34 12)" />
    </svg>
  );
}

const WHY_ITEMS = [
  {
    text: "Cooking can be challenging for beginners and busy individuals, especially when multitasking.",
    image: panImg,
  },
  {
    text: "Manual recipe apps require touch interaction, which is inconvenient when hands are messy or occupied.",
    image: touchImg,
  },
  {
    text: "Mistakes or missing ingredients cause frustration and waste.",
    image: confuseImg,
  },
  {
    text: "Need for a hands-free, intelligent cooking assistant that provides real-time help and step-by-step guidance.",
    image: happyImg,
  },
];

export function WhySectionDecor() {
  return (
    <>
      <Sparkle className="pointer-events-none absolute top-10 left-[4%] size-8 opacity-55 md:size-10" />
      <HerbSprig className="pointer-events-none absolute top-8 right-[3%] hidden w-11 opacity-50 md:block lg:w-12" />
      <HerbSprig className="pointer-events-none absolute bottom-14 left-[3%] hidden w-10 opacity-45 md:block lg:w-11 [transform:scaleX(-1)]" />
      <Sparkle className="pointer-events-none absolute right-[4%] bottom-12 size-8 opacity-55 md:size-10" />
    </>
  );
}

export function WhyProblemGrid() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-0 sm:max-w-2xl">
      {WHY_ITEMS.map((item, i) => {
        const imageRight = i % 2 === 1;

        return (
          <ScrollReveal key={i} delay={i * 80}>
            <div
              className={`relative flex min-h-[112px] items-center sm:min-h-[128px] md:min-h-[136px] ${
                i > 0 ? "-mt-8 sm:-mt-10 md:-mt-12" : ""
              }`}
            >
              <img
                src={item.image}
                alt=""
                aria-hidden
                className={`pointer-events-none absolute top-1/2 z-0 h-auto w-[min(78vw,260px)] max-w-none -translate-y-1/2 object-contain sm:w-[280px] md:w-[300px] ${
                  imageRight ? "right-0 sm:right-[2%]" : "left-0 sm:left-[2%]"
                }`}
              />
              <div
                className={`relative z-10 flex w-full items-center ${
                  imageRight ? "justify-start pl-[6%] sm:pl-[10%]" : "justify-end pr-[6%] sm:pr-[10%]"
                }`}
              >
                <p className="max-w-[9.5rem] text-center font-sans text-[12.5px] leading-snug font-light text-[#2c3818] [text-shadow:0_0_12px_rgba(230,226,212,0.85),0_0_4px_rgba(230,226,212,0.95)] sm:max-w-[10.5rem] sm:text-[13.5px] md:max-w-[11.5rem] md:text-[14px] md:leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
