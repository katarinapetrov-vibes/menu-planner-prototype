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
import { Scatter } from 'react-chartjs-2'
import { primitives, radius, semantic, spacing, typography } from '@/lib/tokens'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Scatter/Multi axis/Chart (node 8539:176870)
//
// "Multi axis" means each dataset can bind to a separate y-axis:
//   Left  y-axis (y)  — position 'left',  normal direction (100 at top, -100 at bottom)
//   Right y-axis (y1) — position 'right', REVERSED direction (-100 at top, 100 at bottom)
//
// Figma second vertical info labels read -100→100 top-to-bottom, confirming the
// right axis has Chart.js `reverse: true`.
//
// Point colours (identical to bubble chart):
//   fill_KRMYVW   = rgba(6, 122, 70, 0.5)    — Dataset 1 fill
//   fill_2LJ0UK   = rgba(210, 248, 149, 0.5) — Dataset 2 fill
//   stroke_65VLRS = #067A46 (1px)             — Dataset 1 border
//   stroke_7P2LXO = #D2F895 (1px)             — Dataset 2 border
//   All points are Size=small → 16×16 px → pointRadius ≈ 5
//
// X-axis:  -100, -60, -20, 20, 40, 60 (numeric, -100…60)
// Y-axis:  -100…100 (both axes share the same range in the Figma)
// Tick / grid colours: same tokens as all other charts

export type ScatterChartTheme = 'light' | 'dark'

export interface ScatterPoint {
  x: number
  y: number
}

export interface ScatterChartDataset {
  /** Label shown in the legend and tooltips */
  label: string
  /** Array of { x, y } data points */
  data: ScatterPoint[]
  /**
   * Which y-axis this dataset binds to.
   * 'y'  → left axis  (normal direction, default)
   * 'y1' → right axis (reversed direction — matches Figma)
   */
  yAxisID?: 'y' | 'y1'
  /**
   * Optional CSS color string to override the palette entry.
   * Applied to the point fill (at 50% opacity) and 1px border.
   */
  color?: string
}

export interface ScatterChartProps {
  /** One or more scatter datasets */
  datasets: ScatterChartDataset[]
  /** Show legend above the chart — default true */
  showLegend?: boolean
  /** Show grid lines on both axes — default true */
  showGrid?: boolean
  /**
   * When true, a second y-axis (right side, reversed) is rendered for any
   * dataset with yAxisID='y1'. Defaults to true when more than one dataset
   * is present. Set to false to force all datasets onto the left axis.
   */
  showSecondYAxis?: boolean
  /**
   * Reverse the right y-axis direction — default true (matches Figma spec where
   * the right axis shows -100 at the top and 100 at the bottom).
   */
  y1Reverse?: boolean
  /** Radius of scatter point circles in px — default 5 */
  pointRadius?: number
  /** Fixed x-axis minimum */
  xMin?: number
  /** Fixed x-axis maximum */
  xMax?: number
  /** Fixed left y-axis (y) minimum */
  yMin?: number
  /** Fixed left y-axis (y) maximum */
  yMax?: number
  /** Fixed right y-axis (y1) minimum */
  y1Min?: number
  /** Fixed right y-axis (y1) maximum */
  y1Max?: number
  /** Optional x-axis title */
  xLabel?: string
  /** Optional left y-axis title */
  yLabel?: string
  /** Optional right y-axis title */
  y1Label?: string
  /** Height of the canvas area in px — default 300 */
  height?: number
  theme?: ScatterChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
// Identical to bubble-chart — semi-transparent fill + solid border.

const FILL_PALETTE: Record<ScatterChartTheme, string[]> = {
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

const BORDER_PALETTE: Record<ScatterChartTheme, string[]> = {
  light: [
    primitives.green[600],   // #067A46 — Dataset 1 (Figma stroke_65VLRS)
    primitives.green[300],   // #D2F895 — Dataset 2 (Figma stroke_7P2LXO)
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

// ─── ScatterChart ─────────────────────────────────────────────────────────────

export const ScatterChart = React.forwardRef<HTMLDivElement, ScatterChartProps>(
  (
    {
      datasets,
      showLegend      = true,
      showGrid        = true,
      showSecondYAxis,
      y1Reverse       = true,
      pointRadius     = 5,
      xMin,
      xMax,
      yMin,
      yMax,
      y1Min,
      y1Max,
      xLabel,
      yLabel,
      y1Label,
      height = 300,
      theme  = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    const tickColor  = primitives.grey[600]   // fill_3LSZGC = #676767
    const gridColor  = isDark ? primitives.grey[700] : primitives.grey[300]  // #4B4B4B / #EEEEEE
    const panelBg    = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    const fontFamily = typography.fontFamily.body
    const fontSize   = 14
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])

    // Determine whether the right axis should be rendered.
    // Default: show it whenever at least one dataset explicitly requests 'y1',
    // OR when showSecondYAxis is explicitly true.
    const hasY1Dataset = datasets.some(ds => ds.yAxisID === 'y1')
    const useSecondAxis = showSecondYAxis ?? (hasY1Dataset || datasets.length > 1)

    // Resolve each dataset's axis ID. When useSecondAxis is true and no yAxisID
    // is specified, assign the first dataset to 'y' and subsequent ones to 'y1'.
    const resolvedDatasets = datasets.map((ds, i) => {
      let axisID: 'y' | 'y1'
      if (!useSecondAxis) {
        axisID = 'y'
      } else if (ds.yAxisID) {
        axisID = ds.yAxisID
      } else {
        axisID = i === 0 ? 'y' : 'y1'
      }
      return { ...ds, resolvedAxisID: axisID }
    })

    const chartData: ChartData<'scatter'> = {
      datasets: resolvedDatasets.map((ds, i) => {
        const fill   = ds.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length]
        const border = ds.color ?? BORDER_PALETTE[theme][i % BORDER_PALETTE[theme].length]
        return {
          label:                ds.label,
          data:                 ds.data,
          yAxisID:              ds.resolvedAxisID,
          backgroundColor:      fill,
          borderColor:          border,
          borderWidth:          1,   // stroke_65VLRS / stroke_7P2LXO strokeWeight: 1px
          pointRadius:          pointRadius,
          pointHoverRadius:     pointRadius + 2,
        }
      }),
    }

    const axisLabelBase = {
      display: true,
      color:   tickColor,
      font:    { family: fontFamily, size: fontSize },
      padding: 8,
    }

    const options: ChartOptions<'scatter'> = {
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
              const pt = ctx.raw as ScatterPoint
              return ` (${pt.x}, ${pt.y})`
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
          title: xLabel ? { ...axisLabelBase, text: xLabel } : undefined,
          ...(xMin !== undefined ? { min: xMin } : {}),
          ...(xMax !== undefined ? { max: xMax } : {}),
        },
        // Left y-axis — normal direction
        y: {
          type:     'linear',
          position: 'left',
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
          title: yLabel ? { ...axisLabelBase, text: yLabel } : undefined,
          ...(yMin !== undefined ? { min: yMin } : {}),
          ...(yMax !== undefined ? { max: yMax } : {}),
        },
        // Right y-axis — rendered only when useSecondAxis is true
        ...(useSecondAxis ? {
          y1: {
            type:     'linear' as const,
            position: 'right' as const,
            reverse:  y1Reverse,
            grid: {
              // Suppress duplicate grid lines from the right axis
              display:     false,
              drawOnChartArea: false,
            },
            border: { display: false },
            ticks: {
              color: tickColor,
              font:  { family: fontFamily, size: fontSize },
            },
            title: y1Label ? { ...axisLabelBase, text: y1Label } : undefined,
            ...(y1Min !== undefined ? { min: y1Min } : {}),
            ...(y1Max !== undefined ? { max: y1Max } : {}),
          },
        } : {}),
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
        {/* Legend — centred row, 24×16 swatch with a circle + label per dataset */}
        {showLegend && datasets.length > 0 && (
          <div style={{
            display:        'flex',
            flexDirection:  'row',
            justifyContent: 'center',
            flexWrap:       'wrap',
            gap:            spacing[600],
          }}>
            {resolvedDatasets.map((ds, i) => {
              const swatchFill   = ds.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length]
              const swatchBorder = ds.color ?? BORDER_PALETTE[theme][i % BORDER_PALETTE[theme].length]
              const axisTag      = useSecondAxis
                ? (ds.resolvedAxisID === 'y1' ? ' (R)' : ' (L)')
                : ''
              return (
                <div key={ds.label} style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        spacing[200],
                }}>
                  {/* 24×16 swatch — matches Figma layout_C50K1G */}
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
                    {/* Circle represents the scatter point style */}
                    <div style={{
                      width:           '8px',
                      height:          '8px',
                      borderRadius:    '50%',
                      backgroundColor: swatchBorder,
                      opacity:         0.8,
                    }} />
                  </div>

                  <span style={{
                    fontFamily,
                    fontSize:   `${fontSize}px`,
                    fontWeight: typography.fontWeight.regular,
                    lineHeight: typography.lineHeight.loose,
                    color:      tickColor,
                  }}>
                    {ds.label}{axisTag}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Chart canvas */}
        <div style={{ height: `${height}px`, position: 'relative' }}>
          {isMounted && <Scatter data={chartData} options={options} />}
        </div>
      </div>
    )
  },
)

ScatterChart.displayName = 'ScatterChart'

export default ScatterChart
