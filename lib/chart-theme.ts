"use client";

import { useTheme } from "next-themes";

/**
 * Returns theme-aware colors for recharts components.
 * Recharts renders SVG/HTML with its own internal styles that don't always
 * pick up CSS custom properties, so we resolve colours explicitly here.
 */
export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return {
    // Axis tick text
    axis: dark ? "#9ca3af" : "#6b7280",
    // CartesianGrid lines
    grid: dark ? "#374151" : "#e5e7eb",
    // Legend text
    legend: dark ? "#d1d5db" : "#4b5563",
    // Tooltip background / border
    tooltipBg:     dark ? "#1f2937" : "#ffffff",
    tooltipBorder: dark ? "#374151" : "#e5e7eb",
    tooltipText:   dark ? "#f3f4f6" : "#111827",
  };
}
