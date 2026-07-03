'use client';

import React from 'react';
import { cn } from './utils';
import { typography } from '@/lib/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
// Sourced from Figma: bBJVhJdmpM5E1YczJ8R4Vv / node 8150:170866

export interface BarChartDataPoint {
  month: string;
  dataset1?: number;
  dataset2?: number;
  dataset3?: number;
  dataset4?: number;
  dataset5?: number;
}

export type ChartTheme = 'dark' | 'light';

export interface VerticalBarChartProps {
  data?: BarChartDataPoint[];
  theme?: ChartTheme;
  height?: number;
  className?: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
// Dark-surface colours aligned with Enterprise DS v3
// Accessibility: all dark fills meet WCAG AA 3:1 non-text contrast on #00178C

export const CHART_TOKENS = {
  dark: {
    labelColor: '#676767',
    gridColor:  'rgba(255,255,255,0.06)',
    zeroColor:  'rgba(255,255,255,0.15)',
    datasets: [
      { label: 'Dataset 1', fill: 'rgba(150,220,20,0.55)'  }, // #96DC14 — dark positive
      { label: 'Dataset 2', fill: 'rgba(210,248,149,0.45)' }, // #D2F895 — light positive
      { label: 'Dataset 3', fill: 'rgba(100,160,240,0.55)' }, // informational blue
      { label: 'Dataset 4', fill: 'rgba(253,180,50,0.55)'  }, // warning amber
      { label: 'Dataset 5', fill: 'rgba(155,138,255,0.55)' }, // #9B8AFF — AI / accent purple
    ],
  },
  light: {
    labelColor: '#676767',
    gridColor:  '#eeeeee',
    zeroColor:  '#cccccc',
    datasets: [
      { label: 'Dataset 1', fill: 'rgba(6,122,70,0.5)'    }, // #067A46 — dark positive
      { label: 'Dataset 2', fill: 'rgba(210,248,149,0.5)' }, // #D2F895 — light positive
      { label: 'Dataset 3', fill: 'rgba(0,102,204,0.5)'   }, // informational blue
      { label: 'Dataset 4', fill: 'rgba(180,83,9,0.5)'    }, // warning amber
      { label: 'Dataset 5', fill: 'rgba(109,40,217,0.5)'  }, // accent purple
    ],
  },
} as const;

// ─── Chart geometry constants ─────────────────────────────────────────────────

const VB_W    = 1000;
const VB_H    = 420;
const MARGIN  = { top: 16, right: 24, bottom: 36, left: 48 };
const PLOT_W  = VB_W - MARGIN.left - MARGIN.right;
const PLOT_H  = VB_H - MARGIN.top  - MARGIN.bottom;
const Y_MIN   = -100;
const Y_MAX   =  100;
const Y_RANGE = Y_MAX - Y_MIN;
const Y_TICKS = [100, 80, 60, 40, 20, 0, -20, -40, -60, -80, -100];

const valueToY = (v: number) => PLOT_H * (Y_MAX - v) / Y_RANGE;
const ZERO_Y   = valueToY(0);

// ─── Dataset keys ─────────────────────────────────────────────────────────────

export const DATASET_KEYS = [
  'dataset1', 'dataset2', 'dataset3', 'dataset4', 'dataset5',
] as const;

export type DatasetKey = typeof DATASET_KEYS[number];

// ─── Default data (mirrors Figma frame 8150:170866) ──────────────────────────

export const DEFAULT_CHART_DATA: BarChartDataPoint[] = [
  { month: 'January',  dataset1:  57, dataset2:   7 },
  { month: 'February', dataset1: -55, dataset2: -70 },
  { month: 'March',    dataset1:  -5, dataset2:  45 },
  { month: 'April',    dataset1:  87, dataset2:  50 },
  { month: 'May',      dataset1:  45, dataset2: -30 },
  { month: 'June',     dataset1:  45, dataset2:  63 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function VerticalBarChart({
  data   = DEFAULT_CHART_DATA,
  theme  = 'dark',
  height = 400,
  className,
}: VerticalBarChartProps) {
  const tokens     = CHART_TOKENS[theme];
  const activeKeys = DATASET_KEYS.filter((k) =>
    data.some((d) => d[k] !== undefined)
  );
  const numActive  = activeKeys.length;

  const groupW       = PLOT_W / data.length;
  const groupPadding = groupW * 0.28;
  const barAreaW     = groupW - groupPadding;
  const barGap       = 2;
  const barW         = Math.max(4, (barAreaW - barGap * (numActive - 1)) / numActive);

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>

      {/* Legend */}
      <div className="flex justify-center items-center gap-6 flex-wrap">
        {activeKeys.map((k) => {
          const idx = DATASET_KEYS.indexOf(k);
          const ds  = tokens.datasets[idx];
          return (
            <div key={k} className="flex items-center gap-2">
              <span
                className="inline-block shrink-0 rounded-[2px]"
                style={{ width: 24, height: 16, backgroundColor: ds.fill }}
              />
              <span className="leading-5 whitespace-nowrap" style={{ color: tokens.labelColor, fontSize: typography.fontSize.sm }}>
                {ds.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        style={{ height }}
        aria-label="Vertical bar chart"
        role="img"
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>

          {/* Grid lines */}
          {Y_TICKS.map((tick) => (
            <line
              key={tick}
              x1={0} y1={valueToY(tick)}
              x2={PLOT_W} y2={valueToY(tick)}
              stroke={tick === 0 ? tokens.zeroColor : tokens.gridColor}
              strokeWidth={tick === 0 ? 1.5 : 1}
            />
          ))}

          {/* Y-axis labels */}
          {Y_TICKS.map((tick) => (
            <text
              key={tick}
              x={-8} y={valueToY(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={tokens.labelColor}
              fontSize={12}
            >
              {tick}
            </text>
          ))}

          {/* Bars */}
          {data.map((point, gi) => {
            const groupX = gi * groupW + groupPadding / 2;
            return activeKeys.map((k, bi) => {
              const value = point[k as DatasetKey];
              if (value === undefined || value === 0) return null;
              const idx  = DATASET_KEYS.indexOf(k);
              const barX = groupX + bi * (barW + barGap);
              const barH = Math.abs(valueToY(value) - ZERO_Y);
              const barY = value > 0 ? ZERO_Y - barH : ZERO_Y;
              return (
                <rect
                  key={`${gi}-${k}`}
                  x={barX} y={barY}
                  width={barW} height={barH}
                  fill={tokens.datasets[idx].fill}
                  rx={1} ry={1}
                />
              );
            });
          })}

          {/* X-axis labels */}
          {data.map((point, gi) => {
            const groupX = gi * groupW + groupPadding / 2;
            const labelX = groupX + (numActive * barW + (numActive - 1) * barGap) / 2;
            return (
              <text
                key={point.month}
                x={labelX} y={PLOT_H + 24}
                textAnchor="middle"
                fill={tokens.labelColor}
                fontSize={12}
              >
                {point.month}
              </text>
            );
          })}

        </g>
      </svg>
    </div>
  );
}

export default VerticalBarChart;
