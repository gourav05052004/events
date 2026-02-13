import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateRange(
  startDate?: string | Date | null,
  endDate?: string | Date | null,
  locale: string = 'en-GB'
) {
  if (!startDate) return 'TBD';

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 'TBD';

  const startLabel = start.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (!endDate) return startLabel;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return startLabel;

  if (start.toDateString() === end.toDateString()) {
    return startLabel;
  }

  const endLabel = end.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return `${startLabel} - ${endLabel}`;
}
