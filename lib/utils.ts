import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateSkills(
  repos: { language: string | null; created_at?: string }[]
) {
  const data: Record<string, { count: number; firstYear: number }> = {};
  const currentYear = new Date().getFullYear();

  repos.forEach((repo) => {
    if (!repo.language) return;
    const year = repo.created_at
      ? new Date(repo.created_at).getFullYear()
      : currentYear;
    if (!data[repo.language]) {
      data[repo.language] = { count: 0, firstYear: year };
    }
    data[repo.language].count++;
    if (year < data[repo.language].firstYear) {
      data[repo.language].firstYear = year;
    }
  });

  return Object.entries(data)
    .map(([name, { count, firstYear }]) => ({ name, count, first_year: firstYear }))
    .sort((a, b) => b.count - a.count);
}

export function getMasteryLevel(count: number): {
  label: string;
  className: string;
} {
  if (count >= 15) return { label: "Especialista", className: "text-violet-600 dark:text-violet-400" };
  if (count >= 7)  return { label: "Experiente",   className: "text-blue-600 dark:text-blue-400" };
  if (count >= 3)  return { label: "Intermediário", className: "text-orange-500 dark:text-orange-400" };
  return                  { label: "Iniciante",     className: "text-slate-500 dark:text-slate-400" };
}
