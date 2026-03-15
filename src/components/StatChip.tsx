type StatChipProps = {
  label: string;
  value: string;
};

export const StatChip = ({ label, value }: StatChipProps) => (
  <div className="rounded-full border border-white/60 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-pine/60">{label}</p>
    <p className="font-display text-sm text-ink">{value}</p>
  </div>
);

