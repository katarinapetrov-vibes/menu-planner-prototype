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
// Figma Enterprise DS — Vertical/Bar/Chart (node 8150:170866)
//
// Structure:
//   ┌─ Legend row   (colored 24×16 px swatch + label per dataset)
//   └─ Chart area
//        ├─ Y-axis labels  (Body/Small/Regular 14px · color #676767)
//        ├─ Background lines (horizontal grid · #EEEEEE light / #4B4B4B dark)
//        ├─ Grouped bar columns
//        └─ X-axis labels  (centered below each column group)

export type BarChartTheme = 'light' | 'dark'

export interface BarChartDataset {
  /** Label shown in the legend and tooltips */
  label: string
  /** One numeric value per x-axis category */
  data: number[]
  /**
   * Optional CSS color string to override the palette entry for this dataset.
   * Both the swatch and the bars will use this value.
   */
  color?: string
}

export interface BarChartProps {
  /** One or more datasets rendered as grouped bars */
  datasets: BarChartDataset[]
  /** X-axis category labels — length must match each dataset's data array */
  labels: string[]
  /** Show legend above the chart — default true */
  showLegend?: boolean
  /** Show horizontal grid lines — default true */
  showGrid?: boolean
  /** Fixed y-axis minimum (auto-scaled when omitted) */
  yMin?: number
  /** Fixed y-axis maximum (auto-scaled when omitted) */
  yMax?: number
  /** Height of the canvas area in px — default 300 */
  height?: number
  theme?: BarChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Data-visualisation colour palette ────────────────────────────────────────
// Dataset 1 / 2 colors taken directly from Figma fills:
//   fill_BP221W = rgba(6, 122, 70, 0.5)  → primitives.green[600] @50%
//   fill_DZV0RI = rgba(210, 248, 149, 0.5) → primitives.green[300] @50%
// Remaining slots extend the DS primitive scale at 60% opacity.

const PALETTE: Record<BarChartTheme, string[]> = {
  light: [
    'rgba(6, 122, 70, 0.5)',    // green.600  — Dataset 1 (Figma exact)
    'rgba(210, 248, 149, 0.5)', // green.300  — Dataset 2 (Figma exact)
    'rgba(0, 42, 255, 0.6)',    // blue.600
    'rgba(206, 69, 0, 0.6)',    // orange.600
    'rgba(170, 9, 125, 0.6)',   // pink.600
    'rgba(17, 140, 116, 0.6)',  // teal.600
    'rgba(169, 119, 57, 0.6)',  // brown.600
    'rgba(103, 71, 210, 0.6)',  // purple.600
  ],
  dark: [
    'rgba(150, 220, 20, 0.5)',  // green.400  — dark-mode positive inversion
    'rgba(210, 248, 149, 0.5)', // green.300  — Dataset 2 (same as light)
    'rgba(64, 189, 240, 0.6)',  // blue.400
    'rgba(255, 148, 26, 0.6)',  // orange.400
    'rgba(255, 99, 170, 0.6)',  // pink.400
    'rgba(84, 225, 172, 0.6)',  // teal.400
    'rgba(230, 193, 106, 0.6)', // brown.400
    'rgba(155, 138, 255, 0.6)', // purple.400
  ],
}

// Solid border colour matching each fill — one shade deeper in the scale.
const BORDER_PALETTE: Record<BarChartTheme, string[]> = {
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

// ─── BarChart ─────────────────────────────────────────────────────────────────

export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      datasets,
      labels,
      showLegend = true,
      showGrid = true,
      yMin,
      yMax,
      height = 300,
      theme = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    // fill_77RPA9 in Figma = #676767 — used for all axis tick labels in both modes
    const tickColor  = primitives.grey[600]
    // Grid line: #EEEEEE (grey.300) in light; #4B4B4B (grey.700) in dark
    const gridColor  = isDark ? primitives.grey[700] : primitives.grey[300]
    const panelBg    = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    const fontFamily = typography.fontFamily.body
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])
    const fontSize   = 14  // Body/Small/Regular — matches Figma textStyle

    const chartData: ChartData<'bar'> = {
      labels,
      datasets: datasets.map((ds, i) => {
        const fillColor   = ds.color ?? PALETTE[theme][i % PALETTE[theme].length]
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
        {/* Legend — centered row, 24×16 px swatch + label per dataset */}
        {showLegend && datasets.length > 0 && (
          <div style={{
            display:        'flex',
            flexDirection:  'row',
            justifyContent: 'center',
            flexWrap:       'wrap',
            gap:            spacing[600],
          }}>
            {datasets.map((ds, i) => {
              const swatchColor = ds.color ?? PALETTE[theme][i % PALETTE[theme].length]
              const borderColor = ds.color ?? BORDER_PALETTE[theme][i % BORDER_PALETTE[theme].length]
              return (
                <div key={ds.label} style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        spacing[200],
                }}>
                  {/* Coloured rectangle swatch — Figma layout_N0KT5W: 24×16 px */}
                  <div style={{
                    width:           '24px',
                    height:          '16px',
                    backgroundColor: swatchColor,
                    border:          `1px solid ${borderColor}`,
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

        {/* Chart canvas wrapper — explicit height required by Chart.js */}
        <div style={{ height: `${height}px`, position: 'relative' }}>
          {isMounted && <Bar data={chartData} options={options} />}
        </div>
      </div>
    )
  },
)

BarChart.displayName = 'BarChart'

export default BarChart
