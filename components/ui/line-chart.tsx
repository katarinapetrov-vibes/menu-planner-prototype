'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { primitives, radius, semantic, spacing, typography } from '@/lib/tokens'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler)

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Line/Chart (node 8165:172333)
//
// Line stroke colours (Figma):
//   stroke_XVQ29U = #067A46  (green.600, 2px) — Dataset 1
//   stroke_8RDWO5 = #D2F895  (green.300, 2px) — Dataset 2
//
// Data-point markers:
//   fill_WYVYA4 = #067A46  — Dataset 1 point fill (≈8px circle)
//   fill_EDQBJ3 = #D2F895  — Dataset 2 point fill
//
// Legend swatches: same 24×16 semi-transparent rectangles as the bar chart
//   fill_99ZFL2 = rgba(6, 122, 70, 0.5)    — Dataset 1
//   fill_PSOUS5 = rgba(210, 248, 149, 0.5) — Dataset 2
//
// Grid lines: fill_4MEKZM = #EEEEEE (same as bar chart)
// Tick labels: fill_7QNZZU = #676767 (same as bar chart)

export type LineChartTheme = 'light' | 'dark'

export interface LineChartDataset {
  /** Label shown in the legend and tooltips */
  label: string
  /** One numeric value per x-axis category */
  data: number[]
  /**
   * Optional CSS color string to override the palette entry for this dataset.
   * Applied to the line stroke, data-point fill, and legend swatch.
   */
  color?: string
}

export interface LineChartProps {
  /** One or more datasets rendered as lines */
  datasets: LineChartDataset[]
  /** X-axis category labels — length must match each dataset's data array */
  labels: string[]
  /** Show legend above the chart — default true */
  showLegend?: boolean
  /** Show horizontal grid lines — default true */
  showGrid?: boolean
  /**
   * Fill the area between the line and the x-axis with a semi-transparent
   * version of the line colour — default false
   */
  fill?: boolean
  /**
   * Bézier curve tension.
   * 0 = straight segments · 0.4 = smooth curves — default 0 (straight)
   */
  tension?: number
  /** Radius of data-point circles in px — default 4 */
  pointRadius?: number
  /** Fixed y-axis minimum (auto-scaled when omitted) */
  yMin?: number
  /** Fixed y-axis maximum (auto-scaled when omitted) */
  yMax?: number
  /** Height of the canvas area in px — default 300 */
  height?: number
  theme?: LineChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
// Line stroke / point fill — solid colours sourced from DS primitive scale.
// Matches Figma stroke_XVQ29U (#067A46) and stroke_8RDWO5 (#D2F895) exactly.

const LINE_PALETTE: Record<LineChartTheme, string[]> = {
  light: [
    primitives.green[600],   // #067A46 — Dataset 1 (Figma exact)
    primitives.green[300],   // #D2F895 — Dataset 2 (Figma exact)
    primitives.blue[600],    // #002AFF
    primitives.orange[600],  // #CE4500
    primitives.pink[600],    // #AA097D
    primitives.teal[600],    // #118C74
    primitives.brown[600],   // #A97739
    primitives.purple[600],  // #6747D2
  ],
  dark: [
    primitives.green[400],   // #96DC14 — dark-mode positive inversion
    primitives.green[300],   // #D2F895 — Dataset 2 (same as light)
    primitives.blue[400],    // #40BDF0
    primitives.orange[400],  // #FF941A
    primitives.pink[400],    // #FF63AA
    primitives.teal[400],    // #54E1AC
    primitives.brown[400],   // #E6C16A
    primitives.purple[400],  // #9B8AFF
  ],
}

// Legend swatch fills — semi-transparent, matching Figma fill_99ZFL2 / fill_PSOUS5.
// Extended palette uses the same opacity values.
const SWATCH_PALETTE: Record<LineChartTheme, string[]> = {
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

// Area fill — line colour at 15% opacity, used when fill=true
function toAreaFill(lineColor: string): string {
  // lineColor is a hex value from LINE_PALETTE
  // Convert to rgba at 0.15 opacity by parsing the hex
  const hex = lineColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.15)`
}

// ─── LineChart ────────────────────────────────────────────────────────────────

export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  (
    {
      datasets,
      labels,
      showLegend  = true,
      showGrid    = true,
      fill        = false,
      tension     = 0,
      pointRadius = 4,
      yMin,
      yMax,
      height = 300,
      theme  = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    // fill_7QNZZU in Figma = #676767 — axis tick labels in both modes
    const tickColor = primitives.grey[600]
    // Grid line: #EEEEEE (grey.300) in light; #4B4B4B (grey.700) in dark
    const gridColor = isDark ? primitives.grey[700] : primitives.grey[300]
    const panelBg   = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    const fontFamily = typography.fontFamily.body
    const fontSize   = 14  // HF/Desktop/Small Text — 14px/400
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])

    const chartData: ChartData<'line'> = {
      labels,
      datasets: datasets.map((ds, i) => {
        const lineColor  = ds.color ?? LINE_PALETTE[theme][i % LINE_PALETTE[theme].length]
        const areaColor  = toAreaFill(ds.color ?? LINE_PALETTE[theme][i % LINE_PALETTE[theme].length])
        return {
          label:                ds.label,
          data:                 ds.data,
          borderColor:          lineColor,
          borderWidth:          2,           // stroke_XVQ29U strokeWeight: 2px
          backgroundColor:      fill ? areaColor : lineColor,
          pointBackgroundColor: lineColor,
          pointBorderColor:     lineColor,
          pointRadius:          pointRadius,
          pointHoverRadius:     pointRadius + 2,
          tension,
          fill,
        }
      }),
    }

    const options: ChartOptions<'line'> = {
      responsive:          true,
      maintainAspectRatio: false,
      animation:           { duration: 250 },
      plugins: {
        legend: { display: false }, // custom legend rendered below
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
        x: {
          grid:   { display: false },
          border: { display: false },
          ticks: {
            color: tickColor,
            font:  { family: fontFamily, size: fontSize },
          },
        },
        y: {
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
        {/* Legend — centred row with line+dot indicator per dataset */}
        {showLegend && datasets.length > 0 && (
          <div style={{
            display:        'flex',
            flexDirection:  'row',
            justifyContent: 'center',
            flexWrap:       'wrap',
            gap:            spacing[600],
          }}>
            {datasets.map((ds, i) => {
              const lineColor  = ds.color ?? LINE_PALETTE[theme][i % LINE_PALETTE[theme].length]
              const swatchFill = ds.color
                ? toAreaFill(ds.color).replace('0.15', '0.5')
                : SWATCH_PALETTE[theme][i % SWATCH_PALETTE[theme].length]

              return (
                <div key={ds.label} style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        spacing[200],
                }}>
                  {/*
                    Legend indicator — 24×16 rectangle matching Figma fill_99ZFL2 / fill_PSOUS5.
                    A horizontal line at the vertical midpoint with a circle in the centre
                    communicates the line+point style without deviating from the Figma swatch size.
                  */}
                  <div style={{
                    position:        'relative',
                    width:           '24px',
                    height:          '16px',
                    flexShrink:      0,
                    backgroundColor: swatchFill,
                    border:          `1px solid ${lineColor}`,
                    borderRadius:    '2px',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                  }}>
                    {/* Line stroke through centre */}
                    <div style={{
                      position:   'absolute',
                      left:       0,
                      right:      0,
                      height:     '2px',
                      background: lineColor,
                    }} />
                    {/* Data-point circle at centre */}
                    <div style={{
                      position:        'relative',
                      width:           '6px',
                      height:          '6px',
                      borderRadius:    '50%',
                      backgroundColor: lineColor,
                      flexShrink:      0,
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

        {/* Chart canvas wrapper — explicit height required by Chart.js */}
        <div style={{ height: `${height}px`, position: 'relative' }}>
          {isMounted && <Line data={chartData} options={options} />}
        </div>
      </div>
    )
  },
)

LineChart.displayName = 'LineChart'

export default LineChart
