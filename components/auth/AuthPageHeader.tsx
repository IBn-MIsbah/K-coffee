import { cn } from "@/lib/utils";

type AuthPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
};

export default function AuthPageHeader({
  eyebrow = "K-Coffee account",
  title,
  description,
  className,
}: AuthPageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800 dark:text-amber-300">
        {eyebrow}
      </p>
      <div className="space-y-2">
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.035em] text-stone-950 sm:text-[2rem] dark:text-stone-50">
          {title}
        </h1>
        <p className="max-w-[38rem] text-pretty text-sm leading-6 text-stone-600 dark:text-stone-300">
          {description}
        </p>
      </div>
    </header>
  );
}
