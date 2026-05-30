import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";

export type Crumb = { label: string; href?: string };

type Props = {
  items: Crumb[];
  variant?: "inline" | "pill" | "text";
  className?: string;
  /**
   * Pill only: which segment uses primary emphasis.
   * `first` matches the marketing landing (brand-first); `last` matches app analytics (current page).
   */
  pillAccent?: "first" | "last";
  /** Pill only: visual separator between segments. */
  pillSeparator?: "slash" | "chevron";
};

export function AcademicBreadcrumb({
  items,
  variant = "inline",
  className = "",
  pillAccent = "last",
  pillSeparator = "slash",
}: Props) {
  if (items.length === 0) {
    return null;
  }

  if (variant === "pill") {
    const chevron = pillSeparator === "chevron";
    const navBase = chevron
      ? "inline-flex items-center rounded-full bg-surface-container-highest/30 px-4 py-1.5 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant backdrop-blur-md"
      : "inline-flex items-center rounded-full bg-surface-container-highest/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant backdrop-blur-sm";

    return (
      <nav
        className={`${navBase} ${className}`.trim()}
        aria-label="Breadcrumb"
      >
        {items.map((item, i) => {
          const isAccent =
            pillAccent === "first" ? i === 0 : i === items.length - 1;
          const segmentClass = isAccent ? "text-primary" : "";

          return (
            <span key={`${item.label}-${i}`} className="flex items-center">
              {i > 0 ? (
                chevron ? (
                  <MaterialIcon
                    name="chevron_right"
                    className="mx-1 text-[12px] text-outline opacity-80"
                  />
                ) : (
                  <span className="mx-2 opacity-50" aria-hidden>
                    /
                  </span>
                )
              ) : null}
              {item.href ? (
                <Link
                  href={item.href}
                  className={`${segmentClass} hover:text-primary`.trim()}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={segmentClass}>{item.label}</span>
              )}
            </span>
          );
        })}
      </nav>
    );
  }

  if (variant === "text") {
    return (
      <nav
        className={`mb-8 flex flex-wrap items-center gap-2 text-xs font-medium text-on-surface-variant ${className}`.trim()}
        aria-label="Breadcrumb"
      >
        {items.map((item, i) => (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? (
              <MaterialIcon
                name="chevron_right"
                className="text-[14px] opacity-50"
              />
            ) : null}
            {i === items.length - 1 ? (
              <span className="font-bold text-primary">{item.label}</span>
            ) : item.href ? (
              <Link href={item.href} className="hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className={`flex items-center gap-2 px-1 text-xs font-medium ${className}`.trim()}
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 ? (
            <MaterialIcon
              name="chevron_right"
              className="text-[14px] opacity-40"
            />
          ) : null}
          {i === items.length - 1 ? (
            <span className="text-primary">{item.label}</span>
          ) : item.href ? (
            <Link
              href={item.href}
              className="text-on-surface-variant hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-on-surface-variant">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
