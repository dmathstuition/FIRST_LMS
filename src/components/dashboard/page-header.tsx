/**
 * Dashboard page header rendered as a soft, friendly hero banner.
 *
 * The last word of the title gets a playful multi-colour gradient (echoing the
 * "My Classes" reference), and optional actions sit on the right. Used across
 * the student, instructor, and admin dashboards so every page shares the feel.
 */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  const words = title.trim().split(" ");
  const last = words.pop() ?? title;
  const lead = words.join(" ");

  return (
    <div className="surface-soft animate-fade-in relative mb-6 flex flex-col gap-4 overflow-hidden rounded-3xl border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {lead && <span>{lead} </span>}
          <span className="text-gradient-multi">{last}</span>
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}
