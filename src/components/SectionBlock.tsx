import type { ReactNode } from "react";

type SectionBlockProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export const SectionBlock = ({ title, description, children }: SectionBlockProps) => (
  <section className="space-y-4 rounded-[28px] border border-white/50 bg-white/80 p-5 shadow-deal backdrop-blur md:p-6">
    <div className="space-y-1">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <p className="text-sm text-ink/70">{description}</p>
    </div>
    {children}
  </section>
);

