export function PageHeader({
  title,
  subtitle,
  actions,
}) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
