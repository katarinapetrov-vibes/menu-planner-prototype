'use client'

import React from 'react'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Bubble } from 'react-chartjs-2'
import { primitives, radius, semantic, spacing, typography } from '@/lib/tokens'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Bubble/Chart (node 8165:174610)
//
// Bubble fill colours (legend swatches — same as bar/line):
//   fill_O68VWH = rgba(6, 122, 70, 0.5)    — Dataset 1
//   fill_5KP7KD = rgba(210, 248, 149, 0.5) — Dataset 2
//
// Bubble border strokes (1px):
//   stroke_I3FWJP = #067A46 — Dataset 1
//   stroke_7G6K40 = #D2F895 — Dataset 2
//
// Bubble sizes (Figma component variants → Chart.js pixel radii):
//   Size=small  → 16×16 px total → r = 8
//   Size=medium → 24×24 px total → r = 12
//   Size=large  → 32×32 px total → r = 16
//
// Both axes use LinearScale (numeric x and y values, no categories).
// Grid lines: fill_582XX6 = #EEEEEE / dark #4B4B4B (same as bar/line).
// Tick labels: fill_4O7DFL = #676767 (same as bar/line).

export type BubbleChartTheme = 'light' | 'dark'

export interface BubblePoint {
  /** Numeric x-axis value */
  x: number
  /** Numeric y-axis value */
  y: number
  /**
   * Bubble radius in pixels.
   * Figma named sizes: small = 8, medium = 12, large = 16.
   */
  r: number
}

export interface BubbleChartDataset {
  /** Label shown in the legend and tooltips */
  label: string
  /** Array of { x, y, r } data points */
  data: BubblePoint[]
  /**
   * Optional CSS color string to override the palette entry for this dataset.
   * Applied to both the bubble fill (at 50% opacity) and the 1px border.
   */
  color?: string
}

export interface BubbleChartProps {
  /** One or more datasets of scatter bubbles */
  datasets: BubbleChartDataset[]
  /** Show legend above the chart — default true */
  showLegend?: boolean
  /** Show grid lines on both axes — default true */
  showGrid?: boolean
  /** Fixed x-axis minimum */
  xMin?: number
  /** Fixed x-axis maximum */
  xMax?: number
  /** Fixed y-axis minimum */
  yMin?: number
  /** Fixed y-axis maximum */
  yMax?: number
  /** Optional x-axis title label */
  xLabel?: string
  /** Optional y-axis title label */
  yLabel?: string
  /** Height of the canvas area in px — default 300 */
  height?: number
  theme?: BubbleChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
// Fill = semi-transparent (Figma fill_O68VWH / fill_5KP7KD exactly for datasets 1/2).
// Border = solid primitive (Figma stroke_I3FWJP / stroke_7G6K40).

const FILL_PALETTE: Record<BubbleChartTheme, string[]> = {
  light: [
    'rgba(6, 122, 70, 0.5)',    // green.600 @50% — Dataset 1 (Figma exact)
    'rgba(210, 248, 149, 0.5)', // green.300 @50% — Dataset 2 (Figma exact)
    'rgba(0, 42, 255, 0.5)',    // blue.600
    'rgba(206, 69, 0, 0.5)',    // orange.600
    'rgba(170, 9, 125, 0.5)',   // pink.600
    'rgba(17, 140, 116, 0.5)',  // teal.600
    'rgba(169, 119, 57, 0.5)',  // brown.600
    'rgba(103, 71, 210, 0.5)',  // purple.600
  ],
  dark: [
    'rgba(150, 220, 20, 0.5)',  // green.400 @50%
    'rgba(210, 248, 149, 0.5)', // green.300 @50%
    'rgba(64, 189, 240, 0.5)',  // blue.400
    'rgba(255, 148, 26, 0.5)',  // orange.400
    'rgba(255, 99, 170, 0.5)',  // pink.400
    'rgba(84, 225, 172, 0.5)',  // teal.400
    'rgba(230, 193, 106, 0.5)', // brown.400
    'rgba(155, 138, 255, 0.5)', // purple.400
  ],
}

const BORDER_PALETTE: Record<BubbleChartTheme, string[]> = {
  light: [
    primitives.green[600],   // #067A46 — Dataset 1 (Figma stroke_I3FWJP)
    primitives.green[300],   // #D2F895 — Dataset 2 (Figma stroke_7G6K40)
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

// ─── BubbleChart ──────────────────────────────────────────────────────────────

export const BubbleChart = React.forwardRef<HTMLDivElement, BubbleChartProps>(
  (
    {
      datasets,
      showLegend = true,
      showGrid   = true,
      xMin,
      xMax,
      yMin,
      yMax,
      xLabel,
      yLabel,
      height = 300,
      theme  = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    // fill_4O7DFL = #676767 — all tick labels in both modes
    const tickColor = primitives.grey[600]
    // Grid: #EEEEEE (grey.300) light / #4B4B4B (grey.700) dark
    const gridColor = isDark ? primitives.grey[700] : primitives.grey[300]
    const panelBg   = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    const fontFamily = typography.fontFamily.body
    const fontSize   = 14  // HF/Desktop/Small Text
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])

    const chartData: ChartData<'bubble'> = {
      datasets: datasets.map((ds, i) => {
        const fill   = ds.color
          // custom color: derive fill by injecting opacity into a hex-like value
          ? ds.color
          : FILL_PALETTE[theme][i % FILL_PALETTE[theme].length]
        const border = ds.color
          ? ds.color
          : BORDER_PALETTE[theme][i % BORDER_PALETTE[theme].length]
        return {
          label:           ds.label,
          data:            ds.data,
          backgroundColor: fill,
          borderColor:     border,
          borderWidth:     1,   // stroke_I3FWJP / stroke_7G6K40 strokeWeight: 1px
        }
      }),
    }

    const axisLabelStyle = {
      display: true,
      color:   tickColor,
      font:    { family: fontFamily, size: fontSize },
      padding: 8,
    }

    const options: ChartOptions<'bubble'> = {
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
              const pt = ctx.raw as BubblePoint
              return ` (${pt.x}, ${pt.y})  r=${pt.r}`
            },
          },
        },
      },
      scales: {
        x: {
          type:   'linear',
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
          title: xLabel ? { ...axisLabelStyle, text: xLabel } : undefined,
          ...(xMin !== undefined ? { min: xMin } : {}),
          ...(xMax !== undefined ? { max: xMax } : {}),
        },
        y: {
          type:   'linear',
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
          title: yLabel ? { ...axisLabelStyle, text: yLabel } : undefined,
          ...(yMin !== undefined ? { min: yMin } : {}),
          ...(yMax !== undefined ? { max: yMax } : {}),
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
                  {/*
                    Legend swatch — 24×16 px rectangle matching Figma fill_O68VWH / fill_5KP7KD.
                    A centred circle represents the bubble shape within the swatch.
                  */}
                  <div style={{
                    position:        'relative',
                    width:           '24px',
                    height:          '16px',
                    flexShrink:      0,
                    backgroundColor: swatchFill,
                    border:          `1px solid ${swatchBorder}`,
                    borderRadius:    '2px',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                  }}>
                    {/* Circle inside the swatch — evokes the bubble shape */}
                    <div style={{
                      width:           '10px',
                      height:          '10px',
                      borderRadius:    '50%',
                      backgroundColor: swatchBorder,
                      opacity:         0.7,
                    }} />
                  </div>

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
          {isMounted && <Bubble data={chartData} options={options} />}
        </div>
      </div>
    )
  },
)

BubbleChart.displayName = 'BubbleChart'

export default BubbleChart
