export const PastaArt = ({ className = "" }) => (
  <svg className={`card-art ${className}`} width="68" height="65" viewBox="0 0 68 65" fill="none">
    <ellipse cx="34" cy="50" rx="24" ry="9" fill="#d4cc9a" opacity="0.55" />
    <ellipse cx="34" cy="48" rx="20" ry="7" fill="#ddd6b0" opacity="0.6" />
    <path d="M16 44 Q22 34 34 36 Q46 38 50 44" stroke="#968440" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M18 48 Q26 38 38 40 Q46 42 50 48" stroke="#968440" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M20 52 Q30 44 40 46 Q48 48 50 52" stroke="#a08e48" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <circle cx="33" cy="28" r="8.5" fill="#cc5030" opacity="0.72" />
    <circle cx="25" cy="33" r="5.5" fill="#c44028" opacity="0.52" />
    <circle cx="42" cy="31" r="5" fill="#c85a38" opacity="0.52" />
    <path d="M30 20 Q32 13 37 11" stroke="#4a7830" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <ellipse cx="37" cy="11" rx="3" ry="5" fill="#5a8a40" opacity="0.6" transform="rotate(-20 37 11)" />
  </svg>
);

export const VeggieArt = ({ className = "" }) => (
  <svg className={`card-art ${className}`} width="68" height="62" viewBox="0 0 68 62" fill="none">
    <ellipse cx="24" cy="36" rx="13" ry="17" fill="#5aaa50" opacity="0.58" />
    <ellipse cx="24" cy="40" rx="5" ry="7" fill="#c8a858" opacity="0.52" />
    <circle cx="44" cy="30" r="14" fill="#e8a030" opacity="0.65" />
    <circle cx="30" cy="52" r="6" fill="#d84030" opacity="0.55" />
    <line x1="24" y1="19" x2="24" y2="12" stroke="#387028" strokeWidth="1.6" strokeLinecap="round" />
    <ellipse cx="21" cy="11" rx="3" ry="5" fill="#4a8030" opacity="0.52" transform="rotate(-18 21 11)" />
  </svg>
);

export const TimerArt = ({ className = "" }) => (
  <svg className={`card-art ${className}`} width="68" height="68" viewBox="0 0 68 68" fill="none">
    <ellipse cx="34" cy="57" rx="22" ry="7" fill="#ccc09a" opacity="0.5" />
    <circle cx="34" cy="34" r="20" fill="#c4b668" opacity="0.36" />
    <circle cx="34" cy="34" r="2" fill="#786628" />
    <line x1="34" y1="34" x2="34" y2="19" stroke="#786628" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="34" y1="34" x2="46" y2="39" stroke="#786628" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="22" cy="50" r="4" fill="#c05030" opacity="0.5" />
  </svg>
);

export const AvatarArt = ({ className = "" }) => (
  <svg className={className} width="72" height="72" viewBox="0 0 72 72" fill="none">
    <circle cx="36" cy="36" r="36" fill="#728e50" />
    <circle cx="36" cy="28" r="13" fill="#eef0e2" opacity="0.92" />
    <ellipse cx="36" cy="58" rx="19" ry="13" fill="#eef0e2" opacity="0.78" />
  </svg>
);

export const BowlArt = () => (
  <svg width="64" height="58" viewBox="0 0 68 65" fill="none">
    <ellipse cx="34" cy="50" rx="26" ry="10" fill="#c8d0a0" opacity="0.5" />
    <circle cx="26" cy="36" r="8" fill="#5aaa50" opacity="0.62" />
    <circle cx="44" cy="34" r="7" fill="#e8a030" opacity="0.65" />
  </svg>
);

export const FishArt = () => (
  <svg width="64" height="58" viewBox="0 0 68 65" fill="none">
    <ellipse cx="33" cy="36" rx="19" ry="10" fill="#f0a840" opacity="0.55" />
    <circle cx="22" cy="33" r="2.5" fill="#202018" opacity="0.55" />
  </svg>
);

export const EggsArt = () => (
  <svg width="64" height="58" viewBox="0 0 68 65" fill="none">
    <rect x="10" y="28" width="48" height="22" rx="8" fill="#c84030" opacity="0.6" />
    <ellipse cx="26" cy="38" rx="8" ry="7" fill="#f0e8c8" opacity="0.88" />
    <ellipse cx="44" cy="38" rx="7.5" ry="7" fill="#f0e8c8" opacity="0.88" />
  </svg>
);

export const PuddingArt = () => (
  <svg width="64" height="58" viewBox="0 0 68 65" fill="none">
    <rect x="18" y="26" width="32" height="22" rx="10" fill="#f0d068" opacity="0.6" />
    <ellipse cx="28" cy="22" rx="6" ry="5" fill="#f0a830" opacity="0.72" />
  </svg>
);

export const RisottoArt = () => (
  <svg width="64" height="58" viewBox="0 0 68 65" fill="none">
    <ellipse cx="34" cy="44" rx="20" ry="8" fill="#ddd4a8" opacity="0.6" />
    <circle cx="28" cy="36" r="6" fill="#806040" opacity="0.55" />
  </svg>
);

export const EmptyPlateArt = () => (
  <svg width="120" height="110" viewBox="0 0 120 110" fill="none">
    <ellipse cx="60" cy="88" rx="48" ry="16" fill="#cfc8b0" opacity="0.35" />
    <circle cx="60" cy="56" r="42" fill="#ddd8c4" opacity="0.55" />
    <circle cx="60" cy="56" r="17" fill="#f0ecde" opacity="0.6" />
    <path d="M44 30 Q50 20 58 18" stroke="#5a8a40" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </svg>
);

export const ART_MAP = {
  pasta: PastaArt,
  bowl: BowlArt,
  fish: FishArt,
  eggs: EggsArt,
  pudding: PuddingArt,
  risotto: RisottoArt,
};
