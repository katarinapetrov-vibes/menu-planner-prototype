'use client'

import React from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { PolarArea } from 'react-chartjs-2'
import { primitives, radius, semantic, spacing, typography } from '@/lib/tokens'

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend)

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Polar Area/Chart (node 8143:169178)
//
// A polar area chart divides a circle into equal-angle sectors; each sector's
// RADIUS reflects its value (unlike pie where arc length reflects value).
// All sectors share the same angular width — n sectors each span 360/n degrees.
//
// Slice colours (identical to Pie/Donut — DS [200]/[100] tints):
//   fill_EHE4OY = #E4FABF  (primitives.green[200])   — Green
//   fill_TY2R03 = #FFFAB2  (primitives.yellow[200])  — Yellow
//   fill_XECRPJ = #FFECD3  (primitives.orange[100])  — Orange
//   fill_U0Z9OH = #FFCCCA  (primitives.red[200])     — Red
//   fill_XM2TKR = #E9FAFF  (primitives.blue[100])    — Blue
//
// Grid rings: stroke_8L8HUA = #E4E4E4, 1px  (slightly darker than other chart grids)
//   Concentric rings at equal radial intervals — no angle lines (spokes) visible.
// Slice border: stroke_ABC5UY = #FFFFFF, 1px  (white gap between sectors)
//
// Radial scale: Vertical Info shows 50, 40, 30, 20, 10 → max=50, stepSize=10
//
// Legend (Details): row, centred, gap 24px — identical to Pie/Donut/Radar
//   Each item: 24×16 solid swatch (layout_8LIJXP) + label
//   Label: HF/Desktop/Small Text — Source Sans Pro 14px/400, #676767

export type PolarAreaChartTheme = 'light' | 'dark'

export interface PolarAreaChartSlice {
  /** Label shown in the legend and tooltip */
  label: string
  /** Numeric value that sets the sector radius */
  value: number
  /**
   * Optional CSS color string to override the palette entry for this slice.
   * Applied to the sector fill and legend swatch.
   */
  color?: string
}

export interface PolarAreaChartProps {
  /** One or more slices rendered as equal-angle polar sectors */
  slices: PolarAreaChartSlice[]
  /** Show legend below the chart — default true */
  showLegend?: boolean
  /** Show concentric ring grid lines — default true */
  showGrid?: boolean
  /**
   * Maximum value of the radial scale.
   * Figma default: 50 (rings at 10, 20, 30, 40, 50).
   * Set to undefined to let Chart.js auto-scale.
   */
  max?: number
  /**
   * Step size between concentric rings — default 10.
   * Ignored when max is undefined (auto-scaled).
   */
  stepSize?: number
  /**
   * Pixel expansion of a sector on hover — default 8.
   * Set to 0 to disable.
   */
  hoverOffset?: number
  /** Height of the canvas area in px — default 300 */
  height?: number
  theme?: PolarAreaChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
// Identical to Pie/Donut — DS [200]/[100] tints for light, [300] for dark.

const FILL_PALETTE: Record<PolarAreaChartTheme, string[]> = {
  light: [
    primitives.green[200],   // #E4FABF — Green  (Figma fill_EHE4OY exact)
    primitives.yellow[200],  // #FFFAB2 — Yellow (Figma fill_TY2R03 exact)
    primitives.orange[100],  // #FFECD3 — Orange (Figma fill_XECRPJ exact)
    primitives.red[200],     // #FFCCCA — Red    (Figma fill_U0Z9OH exact)
    primitives.blue[100],    // #E9FAFF — Blue   (Figma fill_XM2TKR exact)
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

// ─── PolarAreaChart ───────────────────────────────────────────────────────────

export const PolarAreaChart = React.forwardRef<HTMLDivElement, PolarAreaChartProps>(
  (
    {
      slices,
      showLegend  = true,
      showGrid    = true,
      max         = 50,
      stepSize    = 10,
      hoverOffset = 8,
      height      = 300,
      theme       = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    const tickColor   = primitives.grey[600]  // #676767 — fill_5MGDCT (legend + tick labels)
    const panelBg     = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    // Concentric ring grid: #E4E4E4 (stroke_8L8HUA) light / grey[700] dark
    const gridColor   = isDark ? primitives.grey[700] : primitives.grey[400]
    // 1px white gap between sectors (stroke_ABC5UY); matches panel bg in dark
    const borderColor = isDark ? semantic.background.container.dark : primitives.grey[100]
    const fontFamily  = typography.fontFamily.body
    const fontSize    = 14   // HF/Desktop/Small Text — 14px/400

    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])

    const resolvedColors = slices.map(
      (s, i) => s.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length],
    )

    const chartData: ChartData<'polarArea'> = {
      labels: slices.map(s => s.label),
      datasets: [
        {
          data:            slices.map(s => s.value),
          backgroundColor: resolvedColors,
          borderColor,
          borderWidth:     1,   // stroke_ABC5UY: 1px white gap
          hoverBackgroundColor: resolvedColors.map(c => c),
          hoverBorderColor:    borderColor,
          hoverBorderWidth:    1,
        },
      ],
    }

    const options: ChartOptions<'polarArea'> = {
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
              return ` ${ctx.label}: ${ctx.parsed.r}`
            },
          },
        },
      },
      scales: {
        r: {
          min:  0,
          ...(max !== undefined ? { max } : {}),
          // Concentric rings — no angle lines (spokes) per Figma
          angleLines: { display: false },
          grid: {
            display:   showGrid,
            color:     gridColor,
            lineWidth: 1,
          },
          // Sector border alignment: draw border inside the arc
          // Numeric scale ticks (10, 20, 30, 40, 50 in Figma)
          ticks: {
            display:       true,
            color:         tickColor,
            backdropColor: 'transparent',
            font:          { family: fontFamily, size: 11 },
            ...(max !== undefined ? { stepSize } : {}),
          },
          // No outer axis labels (pointLabels) — polar area sectors are self-labelled
          pointLabels: { display: false },
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
          {isMounted && <PolarArea data={chartData} options={options} />}
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
                  {/* 24×16 solid swatch — matches Figma layout_8LIJXP */}
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

PolarAreaChart.displayName = 'PolarAreaChart'

export default PolarAreaChart
