type EmptyStateProps = {
  title: string;
  body: string;
};

export const EmptyState = ({ title, body }: EmptyStateProps) => (
  <div className="rounded-[24px] border border-dashed border-pine/30 bg-mint/40 p-6 text-center">
    <h3 className="font-display text-lg text-ink">{title}</h3>
    <p className="mt-2 text-sm text-ink/70">{body}</p>
  </div>
);

