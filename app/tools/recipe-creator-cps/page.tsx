'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PageShell,
  PageContent,
  PageHeader,
  KpiRow,
  Stack,
  Cluster,
  Section,
  SectionHeader,
  BodyText,
  MetaText,
  Divider,
} from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import type { SideNavGroup, SideNavUser } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { KPIData } from '@/components/ui/kpi-data'
import { LineChart } from '@/components/ui/line-chart'
import { Dialog } from '@/components/ui/dialog'
import { RadioGroup, RadioButton } from '@/components/ui/radio-button'
import {
  InsertChartOutline,
  TableChartOutline,
  ArrowUpwardOutline,
  ArrowDownwardOutline,
  TrendingUpOutline,
  WarningFilled,
  FlagOutline,
} from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { semantic, spacing, typography, radius, borderWidth } from '@/lib/tokens'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const navGroups: SideNavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'intelligence', label: 'Menu Intelligence', icon: <InsertChartOutline />,  href: '/tools/recipe-creator-cps'      },
      { id: 'pool',         label: 'Recipe Pool',       icon: <TableChartOutline />,   href: '/tools/recipe-creator-cps/pool' },
    ],
  },
]

const navUser: SideNavUser = {
  name:  'Alex Müller',
  role:  'Recipe Developer',
  email: 'alex.muller@hellofresh.com',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type DietaryType = 'Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Dairy-Free' | 'Standard'
type ProteinType = 'Plant' | 'Chicken' | 'Beef' | 'Pork' | 'Fish' | 'Seafood' | 'Lamb'
type DemandLevel = 'High' | 'Medium' | 'Low'

interface GapRow {
  protein:  ProteinType
  dietary:  DietaryType
  demand:   DemandLevel
  score:    number   // CPS gap score 0–100
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const KPI_DATA = {
  activeRecipes:  142,
  openGaps:       18,
  avgRating:      4.3,
  costDelta:      -0.22,   // negative = below CPS benchmark (good)
}

const DIETARY_TYPES: DietaryType[] = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Standard']
const PROTEIN_TYPES: ProteinType[] = ['Plant', 'Chicken', 'Beef', 'Pork', 'Fish', 'Seafood', 'Lamb']

// true = gap, false = covered
const HEATMAP: Record<ProteinType, Record<DietaryType, boolean>> = {
  Plant:   { Vegan: false, Vegetarian: false, 'Gluten-Free': true,  'Dairy-Free': false, Standard: false },
  Chicken: { Vegan: true,  Vegetarian: true,  'Gluten-Free': false, 'Dairy-Free': false, Standard: false },
  Beef:    { Vegan: true,  Vegetarian: true,  'Gluten-Free': false, 'Dairy-Free': true,  Standard: false },
  Pork:    { Vegan: true,  Vegetarian: true,  'Gluten-Free': true,  'Dairy-Free': false, Standard: false },
  Fish:    { Vegan: true,  Vegetarian: false, 'Gluten-Free': false, 'Dairy-Free': false, Standard: false },
  Seafood: { Vegan: true,  Vegetarian: true,  'Gluten-Free': true,  'Dairy-Free': true,  Standard: false },
  Lamb:    { Vegan: true,  Vegetarian: true,  'Gluten-Free': false, 'Dairy-Free': false, Standard: true  },
}

const TOP_GAPS: GapRow[] = [
  { protein: 'Plant',   dietary: 'Gluten-Free', demand: 'High',   score: 91 },
  { protein: 'Chicken', dietary: 'Vegan',       demand: 'High',   score: 87 },
  { protein: 'Seafood', dietary: 'Gluten-Free', demand: 'Medium', score: 74 },
  { protein: 'Beef',    dietary: 'Dairy-Free',  demand: 'Medium', score: 68 },
  { protein: 'Lamb',    dietary: 'Standard',    demand: 'Low',    score: 52 },
]

// 12 weeks of trend data (indexed W1–W12)
const TREND_WEEKS = ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12']
const TREND_DATASETS = [
  { label: 'Plant',   data: [18,19,20,21,22,24,25,26,28,29,31,33], color: semantic.foreground.positive.default.light },
  { label: 'Chicken', data: [32,31,30,30,29,28,27,26,25,24,23,22], color: semantic.foreground.warning.default.light  },
  { label: 'Fish',    data: [12,13,13,14,14,15,15,16,17,18,18,19], color: semantic.foreground.information.default.light },
  { label: 'Beef',    data: [22,22,21,20,20,19,18,18,17,17,16,15], color: semantic.foreground.negative.default.light  },
]

type AIMethod = 'prompt' | 'photo' | 'url'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function demandColour(demand: DemandLevel): string {
  if (demand === 'High')   return semantic.foreground.warning.default.light
  if (demand === 'Medium') return semantic.foreground.default.secondary.light
  return semantic.foreground.default.tertiary.light
}

function gapScoreColour(score: number): string {
  if (score >= 75) return semantic.foreground.negative.default.light
  if (score >= 50) return semantic.foreground.warning.default.light
  return semantic.foreground.default.secondary.light
}

// ─── @temporary component:GapHeatmap
// reason: no DS heatmap/matrix component exists — building one-off with semantic tokens only
// owner: kat
function GapHeatmap() {
  const cellSize = 56

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: spacing[100], tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ width: 80 }} />
            {DIETARY_TYPES.map(d => (
              <th key={d} style={{
                width: cellSize,
                ...typography.scale['body/caption/semi'],
                color: semantic.foreground.default.secondary.light,
                textAlign: 'center',
                paddingBottom: spacing[200],
                whiteSpace: 'nowrap',
              }}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROTEIN_TYPES.map(protein => (
            <tr key={protein}>
              <td style={{
                ...typography.scale['body/sm/regular'],
                color: semantic.foreground.default.primary.light,
                paddingRight: spacing[300],
                whiteSpace: 'nowrap',
              }}>
                {protein}
              </td>
              {DIETARY_TYPES.map(dietary => {
                const isGap = HEATMAP[protein][dietary]
                return (
                  <td key={dietary} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: radius.sm,
                      background: isGap
                        ? semantic.background.warning.defaultSubtle.light
                        : semantic.background.positive.defaultSubtle.light,
                      border: `${borderWidth.thin} solid ${isGap
                        ? semantic.border.warning.light
                        : semantic.border.positive.light}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MetaText emphasis={isGap ? 'secondary' : 'positive'}>
                        {isGap ? 'Gap' : '✓'}
                      </MetaText>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuIntelligencePage() {
  const router = useRouter()

  const [activeNav,      setActiveNav]      = useState('intelligence')
  const [dialogOpen,     setDialogOpen]     = useState(false)
  const [selectedGap,    setSelectedGap]    = useState<GapRow | null>(null)
  const [step,           setStep]           = useState<1 | 2>(1)
  const [creationMethod, setCreationMethod] = useState<'scratch' | 'brief' | 'ai'>('ai')
  const [aiMethod,       setAiMethod]       = useState<AIMethod>('prompt')

  const openDialog = (gap: GapRow) => {
    setSelectedGap(gap)
    setStep(1)
    setCreationMethod('ai')
    setDialogOpen(true)
  }

  const handleDialogPrimary = () => {
    if (step === 1 && creationMethod === 'ai') { setStep(2); return }
    const params = new URLSearchParams({
      method:   creationMethod,
      protein:  selectedGap?.protein ?? '',
      dietary:  selectedGap?.dietary ?? '',
    })
    setDialogOpen(false)
    router.push(`/tools/recipe-creator-cps/builder?${params.toString()}`)
  }

  const costBelowBenchmark = KPI_DATA.costDelta <= 0

  return (
    <PageShell
      sidebar={
        <SideNavigation
          groups={navGroups}
          activeId={activeNav}
          onItemClick={id => setActiveNav(id)}
          user={navUser}
          theme="dark"
        />
      }
      header={
        <Header
          title="Recipe Creator"
          countryDropdown={{ value: countryOptions[0].value, options: countryOptions, onChange: () => {} }}
        />
      }
    >
      <PageContent>
        <PageHeader
          title="Menu Intelligence"
          subtitle="CPS market data — gaps, trends, and cost benchmarks before you build"
          primary={
            <Button variant="fill" color="positive" size="md"
              onClick={() => router.push('/tools/recipe-creator-cps/pool')}>
              Browse Recipe Pool
            </Button>
          }
        />

        <Stack gap={800}>

          {/* ── KPI row ────────────────────────────────────────────────── */}
          <KpiRow dividers>
            <KPIData
              label="Active Recipes"
              value={String(KPI_DATA.activeRecipes)}
              size="large"
            />
            <KPIData
              label="Open Menu Gaps"
              value={
                <span style={{ color: KPI_DATA.openGaps > 0 ? semantic.foreground.warning.default.light : semantic.foreground.positive.default.light }}>
                  {KPI_DATA.openGaps}
                </span>
              }
              size="large"
              leadingIcon={
                KPI_DATA.openGaps > 0
                  ? <span style={{ color: semantic.foreground.warning.default.light, display: 'flex' }}><WarningFilled size={20} /></span>
                  : undefined
              }
            />
            <KPIData
              label="Avg Customer Rating"
              value={KPI_DATA.avgRating.toFixed(1)}
              size="large"
            />
            <KPIData
              label="Cost vs CPS Benchmark"
              value={
                <Cluster gap={100} align="center">
                  <span style={{
                    color: costBelowBenchmark
                      ? semantic.foreground.positive.default.light
                      : semantic.foreground.negative.default.light,
                    display: 'flex',
                  }}>
                    {costBelowBenchmark
                      ? <ArrowDownwardOutline size={20} />
                      : <ArrowUpwardOutline size={20} />}
                  </span>
                  <span style={{
                    ...typography.scale['body/lg/semi'],
                    fontVariantNumeric: 'tabular-nums',
                    color: costBelowBenchmark
                      ? semantic.foreground.positive.default.light
                      : semantic.foreground.negative.default.light,
                  }}>
                    {costBelowBenchmark ? '-' : '+'}£{Math.abs(KPI_DATA.costDelta).toFixed(2)}
                  </span>
                </Cluster>
              }
              size="large"
            />
          </KpiRow>

          {/* ── Two-column: trend chart + gap heatmap ─────────────────── */}
          <Cluster gap={600} align="flex-start" wrap={false}>

            {/* Market trend chart */}
            <div style={{ flex: 2, minWidth: 0 }}>
              <Section title="Market Trends" surface="section" gap={400}
                description="Customer preference shifts over the last 12 weeks by protein type">
                <LineChart
                  datasets={TREND_DATASETS}
                  labels={TREND_WEEKS}
                  height={280}
                  tension={0.3}
                  fill={false}
                  showLegend
                  yMin={0}
                  yMax={50}
                />
              </Section>
            </div>

            {/* Gap heatmap */}
            <div style={{ flex: 3, minWidth: 0 }}>
              {/* @temporary component:GapHeatmap reason:no DS heatmap component owner:kat */}
              <Section title="Menu Coverage" surface="section" gap={400}
                description="Green = covered · Amber = gap identified by CPS">
                <GapHeatmap />
                <Cluster gap={400} style={{ paddingTop: spacing[200] }}>
                  <Cluster gap={200} align="center">
                    <div style={{ width: 12, height: 12, borderRadius: radius.xs, background: semantic.background.positive.defaultSubtle.light, border: `${borderWidth.thin} solid ${semantic.border.positive.light}` }} />
                    <MetaText emphasis="secondary">Covered</MetaText>
                  </Cluster>
                  <Cluster gap={200} align="center">
                    <div style={{ width: 12, height: 12, borderRadius: radius.xs, background: semantic.background.warning.defaultSubtle.light, border: `${borderWidth.thin} solid ${semantic.border.warning.light}` }} />
                    <MetaText emphasis="secondary">Gap</MetaText>
                  </Cluster>
                </Cluster>
              </Section>
            </div>

          </Cluster>

          {/* ── Critical gaps list ─────────────────────────────────────── */}
          <Section title="Critical Gaps" surface="section" gap={300}
            description="Top 5 gaps by CPS demand score — click any row to start a recipe">
            <Stack gap={0}>
              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 80px 80px 160px',
                gap: spacing[400],
                paddingBottom: spacing[200],
                borderBottom: `${borderWidth.thin} solid ${semantic.border.default.light}`,
              }}>
                {['Protein', 'Dietary', 'Demand', 'Score', ''].map((h, i) => (
                  <MetaText key={i} emphasis="tertiary" uppercase>{h}</MetaText>
                ))}
              </div>

              {TOP_GAPS.map((gap, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 80px 80px 160px',
                  gap: spacing[400],
                  alignItems: 'center',
                  padding: `${spacing[300]} 0`,
                  borderBottom: i < TOP_GAPS.length - 1
                    ? `${borderWidth.thin} solid ${semantic.border.default.light}`
                    : 'none',
                }}>
                  <BodyText density="compact" weight="semi" as="span">{gap.protein}</BodyText>
                  <BodyText density="compact" as="span">{gap.dietary}</BodyText>
                  <span style={{
                    ...typography.scale['body/sm/regular'],
                    color: demandColour(gap.demand),
                    fontWeight: gap.demand === 'High' ? typography.fontWeight.semibold : undefined,
                  }}>
                    {gap.demand}
                  </span>
                  <span style={{
                    ...typography.scale['body/sm/semi'],
                    fontVariantNumeric: 'tabular-nums',
                    color: gapScoreColour(gap.score),
                  }}>
                    {gap.score}
                  </span>
                  <Button
                    variant="outline"
                    color="positive"
                    size="sm"
                    showLeadingIcon
                    leadingIcon={<FlagOutline />}
                    onClick={() => openDialog(gap)}
                  >
                    Create recipe
                  </Button>
                </div>
              ))}
            </Stack>
          </Section>

        </Stack>
      </PageContent>

      {/* ── Creation method Dialog ────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        size="md"
        showTitle
        title={
          step === 1
            ? `Create recipe for ${selectedGap?.protein} · ${selectedGap?.dietary}`
            : 'Give the AI something to start with'
        }
        showDescription={false}
        showSwapperGroup
        swapperContent={
          step === 1 ? (
            <RadioGroup
              value={creationMethod}
              onChange={v => setCreationMethod(v as 'scratch' | 'brief' | 'ai')}
              size="md"
            >
              <RadioButton value="scratch" label="From scratch"        description="Start with a blank form" />
              <RadioButton value="brief"   label="From a brief"        description="Use a predefined brief template" />
              <RadioButton value="ai"      label="Generate with AI"    description="AI draft pre-seeded with this gap's protein and dietary type" />
            </RadioGroup>
          ) : (
            <RadioGroup
              value={aiMethod}
              onChange={v => setAiMethod(v as AIMethod)}
              size="md"
            >
              <RadioButton value="prompt" label="Describe the recipe" />
              <RadioButton value="photo"  label="Upload a photo"      />
              <RadioButton value="url"    label="Paste a URL"         />
            </RadioGroup>
          )
        }
        showButtons
        showRightButtons
        rightFilledButton={{
          label:   step === 1 && creationMethod === 'ai' ? 'Next' : 'Start building',
          onClick: handleDialogPrimary,
        }}
        rightOutlineButton={
          step === 2 ? { label: 'Back', onClick: () => setStep(1) } : undefined
        }
        showLeftButtons={false}
      />
    </PageShell>
  )
}
