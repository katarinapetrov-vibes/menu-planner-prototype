'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { primitives, radius, semantic, spacing, typography } from '@/lib/tokens'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Horizontal/Bar/Chart (node 8516:196813)
//
// Chart structure:
//   Y-axis = category labels (January–July) — CategoryScale
//   X-axis = numeric values (-60 … 60)      — LinearScale
//   Bars extend horizontally from the origin (indexAxis: 'y')
//   Grid lines are vertical (on the x / value axis)
//
// Colour tokens (identical to vertical bar chart):
//   fill_PPESKG = rgba(6, 122, 70, 0.5)    — Dataset 1 swatch + fill
//   fill_Q48AUC = rgba(210, 248, 149, 0.5) — Dataset 2 swatch + fill
//   fill_ZR58YV = #676767                  — all tick labels
//   fill_EPJ2JK = #EEEEEE                  — grid lines (light mode)

export type HorizontalBarChartTheme = 'light' | 'dark'

export interface HorizontalBarChartDataset {
  /** Label shown in the legend and tooltips */
  label: string
  /** One numeric value per category label — positive or negative */
  data: number[]
  /**
   * Optional CSS color string to override the palette entry for this dataset.
   * Applied to both the legend swatch and bar fill.
   */
  color?: string
}

export interface HorizontalBarChartProps {
  /** One or more datasets rendered as horizontal grouped bars */
  datasets: HorizontalBarChartDataset[]
  /** Y-axis category labels — length must match each dataset's data array */
  labels: string[]
  /** Show legend above the chart — default true */
  showLegend?: boolean
  /** Show vertical grid lines (on the value / x axis) — default true */
  showGrid?: boolean
  /** Fixed minimum for the numeric (x) axis */
  xMin?: number
  /** Fixed maximum for the numeric (x) axis */
  xMax?: number
  /**
   * Height of the canvas area in px.
   * Defaults to 400 — taller than other charts to accommodate category rows.
   */
  height?: number
  theme?: HorizontalBarChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Data-visualisation colour palette ────────────────────────────────────────
// Identical fills and borders to the vertical BarChart.
// Datasets 1/2 match Figma fills exactly.

const FILL_PALETTE: Record<HorizontalBarChartTheme, string[]> = {
  light: [
    'rgba(6, 122, 70, 0.5)',    // green.600 @50% — Dataset 1 (Figma exact)
    'rgba(210, 248, 149, 0.5)', // green.300 @50% — Dataset 2 (Figma exact)
    'rgba(0, 42, 255, 0.6)',    // blue.600
    'rgba(206, 69, 0, 0.6)',    // orange.600
    'rgba(170, 9, 125, 0.6)',   // pink.600
    'rgba(17, 140, 116, 0.6)',  // teal.600
    'rgba(169, 119, 57, 0.6)',  // brown.600
    'rgba(103, 71, 210, 0.6)',  // purple.600
  ],
  dark: [
    'rgba(150, 220, 20, 0.5)',  // green.400 @50%
    'rgba(210, 248, 149, 0.5)', // green.300 @50%
    'rgba(64, 189, 240, 0.6)',  // blue.400
    'rgba(255, 148, 26, 0.6)',  // orange.400
    'rgba(255, 99, 170, 0.6)',  // pink.400
    'rgba(84, 225, 172, 0.6)',  // teal.400
    'rgba(230, 193, 106, 0.6)', // brown.400
    'rgba(155, 138, 255, 0.6)', // purple.400
  ],
}

const BORDER_PALETTE: Record<HorizontalBarChartTheme, string[]> = {
  light: [
    primitives.green[600],
    primitives.green[300],
    primitives.blue[600],
    primitives.orange[600],
    primitives.pink[600],
    primitives.teal[600],
    primitives.brown[600],
    primitives.purple[600],
  ],
  dark: [
    primitives.green[400],
    primitives.green[300],
    primitives.blue[400],
    primitives.orange[400],
    primitives.pink[400],
    primitives.teal[400],
    primitives.brown[400],
    primitives.purple[400],
  ],
}

// ─── HorizontalBarChart ───────────────────────────────────────────────────────

export const HorizontalBarChart = React.forwardRef<HTMLDivElement, HorizontalBarChartProps>(
  (
    {
      datasets,
      labels,
      showLegend = true,
      showGrid   = true,
      xMin,
      xMax,
      height = 400,
      theme  = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    // fill_ZR58YV = #676767 — all axis tick labels in both modes
    const tickColor  = primitives.grey[600]
    // Grid: #EEEEEE (grey.300) light / #4B4B4B (grey.700) dark
    const gridColor  = isDark ? primitives.grey[700] : primitives.grey[300]
    const panelBg    = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    const fontFamily = typography.fontFamily.body
    const fontSize   = 14  // HF/Desktop/Small Text — 14px/400
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])

    const chartData: ChartData<'bar'> = {
      labels,
      datasets: datasets.map((ds, i) => {
        const fillColor   = ds.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length]
        const borderColor = ds.color ?? BORDER_PALETTE[theme][i % BORDER_PALETTE[theme].length]
        return {
          label:           ds.label,
          data:            ds.data,
          backgroundColor: fillColor,
          borderColor:     borderColor,
          borderWidth:     1,
          borderRadius:    2,
          borderSkipped:   false,
        }
      }),
    }

    const options: ChartOptions<'bar'> = {
      indexAxis:           'y',   // ← horizontal bars
      responsive:          true,
      maintainAspectRatio: false,
      animation:           { duration: 250 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? primitives.grey[700] : primitives.grey[100],
          titleColor:      isDark ? primitives.grey[400] : primitives.grey[800],
          bodyColor:       isDark ? primitives.grey[500] : primitives.grey[600],
          borderColor:     isDark ? primitives.grey[700] : primitives.grey[400],
          borderWidth:     1,
          padding:         { x: 12, y: 8 },
          titleFont:  { family: fontFamily, size: fontSize, weight: 600 },
          bodyFont:   { family: fontFamily, size: fontSize },
          cornerRadius: 4,
        },
      },
      scales: {
        // x is the VALUE axis (numeric) — vertical grid lines sit here
        x: {
          grid: {
            display:   showGrid,
            color:     gridColor,
            lineWidth: 1,
          },
          border: { display: false },
          ticks: {
            color: tickColor,
            font:  { family: fontFamily, size: fontSize },
          },
          ...(xMin !== undefined ? { min: xMin } : {}),
          ...(xMax !== undefined ? { max: xMax } : {}),
        },
        // y is the CATEGORY axis — no grid lines
        y: {
          grid:   { display: false },
          border: { display: false },
          ticks: {
            color: tickColor,
            font:  { family: fontFamily, size: fontSize },
          },
        },
      },
    }

    return (
      <div
        ref={ref}
        className={className}
        style={{
          background:    panelBg,
          padding:       spacing[400],
          borderRadius:  radius.sm,
          display:       'flex',
          flexDirection: 'column',
          gap:           spacing[400],
          ...style,
        }}
      >
        {/* Legend — centred row, 24×16 swatch + label per dataset */}
        {showLegend && datasets.length > 0 && (
          <div style={{
            display:        'flex',
            flexDirection:  'row',
            justifyContent: 'center',
            flexWrap:       'wrap',
            gap:            spacing[600],
          }}>
            {datasets.map((ds, i) => {
              const swatchFill   = ds.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length]
              const swatchBorder = ds.color ?? BORDER_PALETTE[theme][i % BORDER_PALETTE[theme].length]
              return (
                <div key={ds.label} style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        spacing[200],
                }}>
                  {/* 24×16 swatch — matches Figma layout_TO2L5V */}
                  <div style={{
                    width:           '24px',
                    height:          '16px',
                    backgroundColor: swatchFill,
                    border:          `1px solid ${swatchBorder}`,
                    borderRadius:    '2px',
                    flexShrink:      0,
                  }} />
                  <span style={{
                    fontFamily,
                    fontSize:   `${fontSize}px`,
                    fontWeight: typography.fontWeight.regular,
                    lineHeight: typography.lineHeight.loose,
                    color:      tickColor,
                  }}>
                    {ds.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Chart canvas */}
        <div style={{ height: `${height}px`, position: 'relative' }}>
          {isMounted && <Bar data={chartData} options={options} />}
        </div>
      </div>
    )
  },
)

HorizontalBarChart.displayName = 'HorizontalBarChart'

export default HorizontalBarChart
