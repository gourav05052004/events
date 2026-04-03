'use client';

import { CalendarDays } from 'lucide-react';

export interface AcademicYearSelectorProps {
  selectedYear: number;
  onChange: (year: number) => void;
  className?: string;
}

export function getAcademicYears() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const activeStartYear = currentMonth >= 6 ? currentYear : currentYear - 1;

  const years: number[] = [];
  for (let i = activeStartYear - 2; i <= activeStartYear; i += 1) {
    years.push(i);
  }

  return { years, activeStartYear };
}

export function getAcademicYearRange(startYear: number) {
  return {
    yearStart: new Date(`${startYear}-07-01T00:00:00.000Z`).toISOString(),
    yearEnd: new Date(`${startYear + 1}-05-31T23:59:59.999Z`).toISOString(),
    label: `${startYear}–${String(startYear + 1).slice(-2)} (Jul ${startYear} – May ${startYear + 1})`,
  };
}

function getShortLabel(startYear: number) {
  return `${startYear}–${String(startYear + 1).slice(-2)}`;
}

function getTooltip(startYear: number) {
  return `Jul ${startYear} – May ${startYear + 1}`;
}

export function AcademicYearSelector({ selectedYear, onChange, className }: AcademicYearSelectorProps) {
  const { years } = getAcademicYears();

  return (
    <div className={`inline-flex items-center gap-2 ${className || ''}`.trim()}>
      <CalendarDays size={14} className="text-[#8B1E26]" />
      <select
        value={selectedYear}
        onChange={(e) => onChange(Number(e.target.value))}
        title={getTooltip(selectedYear)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 cursor-pointer"
        aria-label="Academic year"
      >
        {years.map((startYear) => (
          <option key={startYear} value={startYear} title={getTooltip(startYear)}>
            {getShortLabel(startYear)}
          </option>
        ))}
      </select>
    </div>
  );
}
