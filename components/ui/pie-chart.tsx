'use client'

import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { primitives, radius, semantic, spacing, typography } from '@/lib/tokens'

ChartJS.register(ArcElement, Tooltip, Legend)

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Pie/Chart (node 8143:169135)
//
// The Pie chart uses the same slice colours and legend structure as the Donut
// chart. The only structural difference is cutout = 0 (no hollow centre).
//
// Slice fills (identical to Doughnt/Chart):
//   fill_0R2RO3 = #E4FABF  (primitives.green[200])   — Green
//   fill_3ADMHX = #FFFAB2  (primitives.yellow[200])  — Yellow
//   fill_HH13G0 = #FFECD3  (primitives.orange[100])  — Orange
//   fill_4HEQSL = #FFCCCA  (primitives.red[200])     — Red
//   fill_Q6VXOV = #E9FAFF  (primitives.blue[100])    — Blue
//
// Slice border: stroke_F802YA = #FFFFFF (1px) — white gap between slices
//
// Legend (Details): row, centred, gap 24px — identical to DonutChart
//   Each item: 24×16 solid swatch (layout_T4D3K0) + label
//   Label: HF/Desktop/Small Text — Source Sans Pro 14px/400, #676767

export type PieChartTheme = 'light' | 'dark'

export interface PieChartSlice {
  /** Label shown in the legend and tooltip */
  label: string
  /** Numeric value for this slice */
  value: number
  /**
   * Optional CSS color string to override the palette entry for this slice.
   * Applied to the slice fill and swatch.
   */
  color?: string
}

export interface PieChartProps {
  /** One or more slices rendered as pie segments */
  slices: PieChartSlice[]
  /** Show legend below the chart — default true */
  showLegend?: boolean
  /**
   * Pixel expansion of a slice on hover — default 8.
   * Set to 0 to disable.
   */
  hoverOffset?: number
  /** Height of the canvas area in px — default 300 */
  height?: number
  theme?: PieChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
// Identical to DonutChart — DS [200]/[100] tints (Figma exact) for light,
// [300] tints for dark mode visibility.

const FILL_PALETTE: Record<PieChartTheme, string[]> = {
  light: [
    primitives.green[200],   // #E4FABF — Green  (Figma fill_0R2RO3 exact)
    primitives.yellow[200],  // #FFFAB2 — Yellow (Figma fill_3ADMHX exact)
    primitives.orange[100],  // #FFECD3 — Orange (Figma fill_HH13G0 exact)
    primitives.red[200],     // #FFCCCA — Red    (Figma fill_4HEQSL exact)
    primitives.blue[100],    // #E9FAFF — Blue   (Figma fill_Q6VXOV exact)
    primitives.teal[200],    // #CBF5E6
    primitives.pink[200],    // #EFD1E0
    primitives.brown[200],   // #F5E4B5
    primitives.purple[200],  // #E6E0FF
  ],
  dark: [
    primitives.green[300],   // #D2F895
    primitives.yellow[300],  // #FFF583
    primitives.orange[300],  // #FFBF74
    primitives.red[300],     // #FCAD9A
    primitives.blue[300],    // #92EAFF
    primitives.teal[300],    // #A5EED4
    primitives.pink[300],    // #F4B1D2
    primitives.brown[300],   // #F2DB9C
    primitives.purple[300],  // #B7ABFF
  ],
}

// ─── PieChart ─────────────────────────────────────────────────────────────────

export const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
  (
    {
      slices,
      showLegend  = true,
      hoverOffset = 8,
      height      = 300,
      theme       = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    const tickColor   = primitives.grey[600]  // #676767 — fill_U2DF68 (legend labels)
    const panelBg     = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    // 1px white gap between slices (Figma stroke_F802YA); matches panel bg in dark
    const borderColor = isDark ? semantic.background.container.dark : primitives.grey[100]
    const fontFamily  = typography.fontFamily.body
    const fontSize    = 14   // HF/Desktop/Small Text — 14px/400

    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])

    const resolvedColors = slices.map(
      (s, i) => s.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length],
    )

    const chartData: ChartData<'pie'> = {
      labels: slices.map(s => s.label),
      datasets: [
        {
          data:            slices.map(s => s.value),
          backgroundColor: resolvedColors,
          borderColor,
          borderWidth:     1,   // stroke_F802YA: 1px white gap
          hoverOffset,
        },
      ],
    }

    const options: ChartOptions<'pie'> = {
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
          callbacks: {
            label: (ctx) => {
              const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0)
              const value = ctx.parsed
              const pct   = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
              return ` ${ctx.label}: ${value} (${pct}%)`
            },
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
        {/* Chart canvas */}
        <div style={{ height: `${height}px`, position: 'relative' }}>
          {isMounted && <Pie data={chartData} options={options} />}
        </div>

        {/* Legend — centred row, 24×16 solid swatch + label per slice */}
        {showLegend && slices.length > 0 && (
          <div style={{
            display:        'flex',
            flexDirection:  'row',
            justifyContent: 'center',
            flexWrap:       'wrap',
            gap:            spacing[600],
          }}>
            {slices.map((s, i) => {
              const swatchColor = s.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length]
              return (
                <div key={s.label} style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        spacing[200],
                }}>
                  {/* 24×16 solid swatch — matches Figma layout_T4D3K0 */}
                  <div style={{
                    width:           '24px',
                    height:          '16px',
                    backgroundColor: swatchColor,
                    border:          `1px solid ${swatchColor}`,
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
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  },
)

PieChart.displayName = 'PieChart'

export default PieChart
