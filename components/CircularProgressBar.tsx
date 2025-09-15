
import React from 'react';

interface CircularProgressBarProps {
  percentage: number;
  label: string;
  value: number;
  goal: number;
  colorClass?: string;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  label,
  value,
  goal,
  colorClass = 'stroke-brand-primary'
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  // Clamp percentage for visual representation (0-100)
  const visualPercentage = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference - (visualPercentage / 100) * circumference;

  // Change color if goal is exceeded
  const dynamicColorClass = percentage > 100 ? 'stroke-red-500' : colorClass;


  return (
    <div className="relative flex items-center justify-center w-48 h-48 neumorphic-outset dark:neumorphic-outset p-2 rounded-full">
        <div className="absolute w-40 h-40 neumorphic-inset rounded-full"></div>
        <svg
            className="transform -rotate-90 w-48 h-48"
            viewBox="0 0 120 120"
        >
            <circle
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
            />
            <circle
                className={`progress-ring__circle--progress ${dynamicColorClass} transition-all duration-500`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
            />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-bold text-ui-text dark:text-slate-50 transition-colors ${percentage > 100 ? 'text-red-500 dark:text-red-400' : ''}`}>{value.toFixed(0)}</span>
            <span className="text-sm text-ui-text-secondary dark:text-slate-400">/ {goal.toFixed(0)}</span>
            <span className="text-sm font-semibold text-ui-text dark:text-slate-300 mt-1">{label}</span>
        </div>
    </div>
  );
};
