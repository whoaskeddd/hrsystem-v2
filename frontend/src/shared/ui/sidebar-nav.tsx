type SidebarNavProps = {
  title: string;
  eyebrow?: string;
  items: string[];
  activeItem?: string;
};

export function SidebarNav({ title, eyebrow, items, activeItem }: SidebarNavProps) {
  return (
    <section className="rounded-shell border border-white/8 bg-elevated/90 p-6 shadow-card backdrop-blur sm:p-8">
      <div className="mb-6">
        {eyebrow ? <p className="mb-2 text-xs uppercase tracking-[0.22em] text-gold-soft/80">{eyebrow}</p> : null}
        <h2 className="font-display text-2xl font-semibold text-primary">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className={[
              "rounded-[18px] border px-4 py-3 text-sm transition",
              item === activeItem ? "border-gold/50 bg-gold/10 text-gold-soft shadow-glow" : "border-white/8 bg-soft/70 text-secondary",
            ].join(" ")}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
