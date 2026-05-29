/** Shared page width, padding, and hero typography */
export function PageShell({ children, className = "" }) {
  return (
    <div className={`page-shell ${className}`.trim()}>{children}</div>
  );
}

export function PageHero({ chips, title, description, className = "" }) {
  return (
    <header className={`page-hero ${className}`.trim()}>
      {chips ? <div className="page-hero-chips">{chips}</div> : null}
      <h1 className="page-title">{title}</h1>
      {description ? <p className="page-desc">{description}</p> : null}
    </header>
  );
}

export function PageChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border-[1.5px] border-[#98ad78] bg-cm-chip px-4 py-1.5 font-sans text-[11px] font-medium tracking-wide text-[#283818] uppercase">
      {children}
    </span>
  );
}
