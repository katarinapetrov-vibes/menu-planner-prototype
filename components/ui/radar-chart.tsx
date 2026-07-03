'use client'

import React from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { primitives, radius, semantic, spacing, typography } from '@/lib/tokens'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Radar/Chart (node 8540:176954)
//
// Spider-web structure:
//   12 axes (months: January–December) radiating from centre
//   Concentric polygon rings at equal intervals (Figma labels: 0, 10, 20, 40, 60, 80, 100)
//   Angle lines (spokes): stroke_7NG9JB = #EEEEEE, 1px — same as other chart grids
//   Grid rings:           stroke_7NG9JB = #EEEEEE, 1px
//   Axis / tick labels:   fill_G6HO1B  = #676767 — HF/Desktop/Small Text (14px/400)
//
// Dataset colours (identical to bar/line/bubble/scatter):
//   Dataset 1 fill:   fill_5J0T6Q  = rgba(6, 122, 70, 0.5)    (green.600 @50%)
//   Dataset 2 fill:   fill_N0N9NP  = rgba(210, 248, 149, 0.5)  (green.300 @50%)
//   Dataset 1 border: stroke_GMJF59 = #067A46  (2px)
//   Dataset 2 border: stroke_XX7OO8 = #D2F895  (2px)
//
// Legend: centred row — 24×16 rectangle swatches, same pattern as all other charts.

export type RadarChartTheme = 'light' | 'dark'

export interface RadarChartDataset {
  /** Label shown in the legend and tooltip */
  label: string
  /** One numeric value per axis label — order must match the top-level `labels` array */
  data: number[]
  /**
   * Optional CSS color string to override the palette entry for this dataset.
   * Applied to both the area fill (at 50% opacity) and the 2px border line.
   */
  color?: string
}

export interface RadarChartProps {
  /** One or more datasets rendered as filled radar polygons */
  datasets: RadarChartDataset[]
  /** Axis labels arranged clockwise from the top — length must match each dataset's data array */
  labels: string[]
  /** Show legend above the chart — default true */
  showLegend?: boolean
  /** Show concentric polygon grid rings and angle lines (spokes) — default true */
  showGrid?: boolean
  /** Fill the polygon area — default true (matches Figma filled datasets) */
  fill?: boolean
  /** Radius of data-point circles in px — default 4 */
  pointRadius?: number
  /** Fixed minimum for the radial scale — default 0 */
  min?: number
  /** Fixed maximum for the radial scale — default 100 */
  max?: number
  /** Step size between concentric rings — default 20 (gives rings at 0, 20, 40, 60, 80, 100) */
  stepSize?: number
  /** Height of the canvas area in px — default 400 */
  height?: number
  theme?: RadarChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
// Fill = semi-transparent area inside the radar polygon.
// Border = solid 2px line around the polygon (Figma strokeWeight: 2px).

const FILL_PALETTE: Record<RadarChartTheme, string[]> = {
  light: [
    'rgba(6, 122, 70, 0.5)',    // green.600 @50% — Dataset 1 (Figma fill_5J0T6Q exact)
    'rgba(210, 248, 149, 0.5)', // green.300 @50% — Dataset 2 (Figma fill_N0N9NP exact)
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

const BORDER_PALETTE: Record<RadarChartTheme, string[]> = {
  light: [
    primitives.green[600],   // #067A46 — Dataset 1 (Figma stroke_GMJF59)
    primitives.green[300],   // #D2F895 — Dataset 2 (Figma stroke_XX7OO8)
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

// ─── RadarChart ───────────────────────────────────────────────────────────────

export const RadarChart = React.forwardRef<HTMLDivElement, RadarChartProps>(
  (
    {
      datasets,
      labels,
      showLegend  = true,
      showGrid    = true,
      fill        = true,
      pointRadius = 4,
      min         = 0,
      max         = 100,
      stepSize    = 20,
      height      = 400,
      theme       = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    // fill_G6HO1B = #676767 — all axis tick and point labels in both modes
    const tickColor  = primitives.grey[600]
    // Grid / spoke: #EEEEEE (grey.300) light / #4B4B4B (grey.700) dark — stroke_7NG9JB
    const gridColor  = isDark ? primitives.grey[700] : primitives.grey[300]
    const panelBg    = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    const fontFamily = typography.fontFamily.body
    const fontSize   = 14  // HF/Desktop/Small Text — 14px/400
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])

    const chartData: ChartData<'radar'> = {
      labels,
      datasets: datasets.map((ds, i) => {
        const fillColor   = ds.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length]
        const borderColor = ds.color ?? BORDER_PALETTE[theme][i % BORDER_PALETTE[theme].length]
        return {
          label:                ds.label,
          data:                 ds.data,
          backgroundColor:      fill ? fillColor : 'transparent',
          borderColor:          borderColor,
          borderWidth:          2,   // Figma stroke_GMJF59 / stroke_XX7OO8 strokeWeight: 2px
          pointRadius:          pointRadius,
          pointHoverRadius:     pointRadius + 2,
          pointBackgroundColor: borderColor,
          pointBorderColor:     borderColor,
          fill,
        }
      }),
    }

    const options: ChartOptions<'radar'> = {
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
        r: {
          min,
          max,
          // Angle lines — spokes from centre to each axis label
          angleLines: {
            display:   showGrid,
            color:     gridColor,
            lineWidth: 1,
          },
          // Concentric polygon grid rings
          grid: {
            display:   showGrid,
            color:     gridColor,
            lineWidth: 1,
          },
          // Axis labels around the perimeter (month names in Figma)
          pointLabels: {
            display: true,
            color:   tickColor,
            font:    { family: fontFamily, size: fontSize },
          },
          // Numeric scale labels along the vertical axis
          ticks: {
            display:        true,
            color:          tickColor,
            font:           { family: fontFamily, size: 11 },
            backdropColor:  'transparent',
            stepSize,
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
                  {/* 24×16 swatch — matches Figma layout_IKPB53 */}
                  <div style={{
                    width:           '24px',
                    height:          '16px',
                    backgroundColor: fill ? swatchFill : 'transparent',
                    border:          `2px solid ${swatchBorder}`,
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
          {isMounted && <Radar data={chartData} options={options} />}
        </div>
      </div>
    )
  },
)

RadarChart.displayName = 'RadarChart'

export default RadarChart
