type TabGroupProps = {
  tabs: string[];
  activeTab: string;
};

export function TabGroup({ tabs, activeTab }: TabGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={[
            "rounded-full border px-4 py-2 text-sm transition",
            tab === activeTab ? "border-gold/50 bg-gold/10 text-gold-soft shadow-glow" : "border-white/10 bg-white/5 text-secondary",
          ].join(" ")}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
