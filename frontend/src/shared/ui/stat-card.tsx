type StatCardProps = {
  label: string;
  value: string;
  meta?: string;
};

export function StatCard({ label, value, meta }: StatCardProps) {
  return (
    <article className="rounded-[22px] border border-white/8 bg-soft/70 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-secondary">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-primary">{value}</p>
      {meta ? <p className="mt-2 text-sm text-secondary">{meta}</p> : null}
    </article>
  );
}
