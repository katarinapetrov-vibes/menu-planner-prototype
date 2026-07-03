'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PageShell,
  PageContent,
  PageHeader,
  Stack,
  Cluster,
  Section,
  SectionHeader,
  BodyText,
  MetaText,
  FieldReadOnly,
} from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import type { SideNavGroup, SideNavUser } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { SideSheet } from '@/components/ui/side-sheet'
import { InputField } from '@/components/ui/input-field'
import { TextArea } from '@/components/ui/text-area'
import { DropdownField } from '@/components/ui/dropdown-field'
import {
  InsertChartOutline,
  TableChartOutline,
  AddOutline,
  ArrowDownwardOutline,
  ArrowUpwardOutline,
  CheckCircleOutline,
  ErrorOutline,
} from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { semantic, spacing, typography, borderWidth } from '@/lib/tokens'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const navGroups: SideNavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'intelligence', label: 'Menu Intelligence', icon: <InsertChartOutline />, href: '/tools/recipe-creator-cps'      },
      { id: 'pool',         label: 'Recipe Pool',       icon: <TableChartOutline />,  href: '/tools/recipe-creator-cps/pool' },
    ],
  },
]

const navUser: SideNavUser = {
  name:  'Alex Müller',
  role:  'Recipe Developer',
  email: 'alex.muller@hellofresh.com',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ChangeType = 'ingredient-swap' | 'portion-change' | 'method-change'

interface IngredientDiff {
  ingredient: string
  base:       string
  variant:    string
}

interface CpsVariant {
  id:            string
  name:          string
  changeType:    ChangeType
  changeSummary: string
  deltaVsBase:   number    // £ vs base recipe cost
  deltaVsCps:    number    // £ vs CPS benchmark (£4.50)
  trendFit:      number    // 0–100 CPS trend fit score
  guardrailPass: boolean
  supplyRisk:    'low' | 'medium' | 'high'
  diff:          IngredientDiff[]
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const BASE_RECIPE = {
  name:      'Sesame Tofu Rice Bowl',
  cost:      '£3.42',
  cpsCost:   '£3.42',
  cpsBench:  '£4.50',
  trendFit:  68,
  protein:   'Plant',
  dietary:   'Vegan',
}

const CPS_BENCHMARK = 4.50
const BASE_COST     = 3.42

const CHANGE_TYPE_OPTIONS = [
  { label: 'Ingredient swap', value: 'ingredient-swap' },
  { label: 'Portion change',  value: 'portion-change'  },
  { label: 'Method change',   value: 'method-change'   },
]

const INITIAL_VARIANTS: CpsVariant[] = [
  {
    id:            'v1',
    name:          'Hemp Seed Swap',
    changeType:    'ingredient-swap',
    changeSummary: 'Replace black sesame with hemp seeds — lower cost, higher protein, better CPS trend alignment',
    deltaVsBase:   -0.18,
    deltaVsCps:    -1.26,
    trendFit:      79,
    guardrailPass: true,
    supplyRisk:    'low',
    diff: [
      { ingredient: 'Seeds', base: 'Black Sesame Seed 5g', variant: 'Hemp Seeds 5g' },
    ],
  },
  {
    id:            'v2',
    name:          'Larger Portion',
    changeType:    'portion-change',
    changeSummary: 'Increase tofu to 250g and rice to 180g — higher calorie, above CPS cost benchmark',
    deltaVsBase:   +0.52,
    deltaVsCps:    -0.56,
    trendFit:      65,
    guardrailPass: false,
    supplyRisk:    'low',
    diff: [
      { ingredient: 'Firm Tofu',  base: '200g', variant: '250g' },
      { ingredient: 'Brown Rice', base: '150g', variant: '180g' },
    ],
  },
  {
    id:            'v3',
    name:          'No Sesame Oil',
    changeType:    'ingredient-swap',
    changeSummary: 'Swap sesame oil for rapeseed oil — removes sesame allergen, improves CPS score',
    deltaVsBase:   -0.31,
    deltaVsCps:    -1.39,
    trendFit:      82,
    guardrailPass: true,
    supplyRisk:    'low',
    diff: [
      { ingredient: 'Oil', base: 'Sesame Oil 15ml', variant: 'Rapeseed Oil 15ml' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trendFitColour(score: number): string {
  if (score >= 70) return semantic.foreground.positive.default.light
  if (score >= 50) return semantic.foreground.warning.default.light
  return semantic.foreground.negative.default.light
}

function deltaColour(delta: number): string {
  return delta <= 0
    ? semantic.foreground.positive.default.light
    : semantic.foreground.negative.default.light
}

function supplyStatus(risk: CpsVariant['supplyRisk']): 'success' | 'warning' | 'error' {
  return risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error'
}

// ─── Delta cell — reused for both vs-base and vs-CPS columns ─────────────────

function DeltaCell({ delta, label }: { delta: number; label: string }) {
  const below = delta <= 0
  return (
    <Stack gap={50}>
      <Cluster gap={100} align="center">
        <span style={{ display: 'flex', color: deltaColour(delta) }}>
          {below ? <ArrowDownwardOutline size={16} /> : <ArrowUpwardOutline size={16} />}
        </span>
        <span style={{
          ...typography.scale['body/sm/semi'],
          fontVariantNumeric: 'tabular-nums',
          color: deltaColour(delta),
        }}>
          {below ? '-' : '+'}£{Math.abs(delta).toFixed(2)}
        </span>
      </Cluster>
      <MetaText emphasis="tertiary">{label}</MetaText>
    </Stack>
  )
}

// ─── Expanded row — ingredient diff + CPS scores ──────────────────────────────

function VariantDiff({ variant }: { variant: CpsVariant }) {
  return (
    <div style={{
      padding: `${spacing[400]} ${spacing[600]}`,
      background: semantic.background.sunken.default.light,
    }}>
      <Stack gap={400}>
        <SectionHeader title="Ingredient changes vs base" level="secondary" />

        {variant.diff.map((d, i) => (
          <Cluster key={i} gap={600} align="center">
            <div style={{ width: 120, flexShrink: 0 }}>
              <MetaText emphasis="tertiary">{d.ingredient}</MetaText>
            </div>
            <Cluster gap={200} align="center">
              <MetaText emphasis="secondary" style={{ textDecoration: 'line-through' }}>{d.base}</MetaText>
              <span style={{ color: semantic.foreground.default.tertiary.light }}>→</span>
              <MetaText emphasis="positive">{d.variant}</MetaText>
            </Cluster>
          </Cluster>
        ))}

        {/* CPS scores summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: spacing[400],
          paddingTop: spacing[200],
          borderTop: `${borderWidth.thin} solid ${semantic.border.default.light}`,
        }}>
          <Stack gap={100}>
            <MetaText emphasis="tertiary" uppercase>Trend Fit</MetaText>
            <span style={{
              ...typography.scale['body/md/semi'],
              fontVariantNumeric: 'tabular-nums',
              color: trendFitColour(variant.trendFit),
            }}>
              {variant.trendFit} / 100
            </span>
          </Stack>
          <Stack gap={100}>
            <MetaText emphasis="tertiary" uppercase>Supply Risk</MetaText>
            <StatusIndicator
              status={supplyStatus(variant.supplyRisk)}
              label={`${variant.supplyRisk.charAt(0).toUpperCase() + variant.supplyRisk.slice(1)} risk`}
            />
          </Stack>
          <Stack gap={100}>
            <MetaText emphasis="tertiary" uppercase>CPS Guardrails</MetaText>
            <Cluster gap={200} align="center">
              <span style={{
                display: 'flex',
                color: variant.guardrailPass
                  ? semantic.foreground.positive.default.light
                  : semantic.foreground.negative.default.light,
              }}>
                {variant.guardrailPass
                  ? <CheckCircleOutline size={16} />
                  : <ErrorOutline size={16} />}
              </span>
              <MetaText emphasis={variant.guardrailPass ? 'positive' : 'negative'}>
                {variant.guardrailPass ? 'Pass' : 'Fail'}
              </MetaText>
            </Cluster>
          </Stack>
        </div>
      </Stack>
    </div>
  )
}

// ─── Table columns ────────────────────────────────────────────────────────────

function buildColumns(variants: CpsVariant[]) {
  return [
    {
      key:        'expand',
      label:      '',
      headerType: 'chevron' as const,
      width:      40,
    },
    {
      key:      'name',
      label:    'Variant',
      sortable: true,
      minWidth: 160,
      render:   (value: unknown, row: Record<string, unknown>) => {
        const v = variants.find(x => x.id === row.id)
        return (
          <Stack gap={50}>
            <BodyText density="compact" weight="semi" as="span">{String(value)}</BodyText>
            <MetaText emphasis="tertiary">{v?.changeSummary.slice(0, 55)}…</MetaText>
          </Stack>
        )
      },
    },
    {
      key:    'changeType',
      label:  'Type',
      width:  140,
      render: (value: unknown) => {
        const labels: Record<ChangeType, string> = {
          'ingredient-swap': 'Ingredient swap',
          'portion-change':  'Portion change',
          'method-change':   'Method change',
        }
        return <MetaText emphasis="secondary">{labels[value as ChangeType]}</MetaText>
      },
    },
    {
      key:    'deltaVsBase',
      label:  'vs Base',
      width:  110,
      align:  'right' as const,
      render: (value: unknown) => <DeltaCell delta={value as number} label="vs base recipe" />,
    },
    {
      key:    'deltaVsCps',
      label:  'vs CPS',
      width:  110,
      align:  'right' as const,
      render: (value: unknown) => <DeltaCell delta={value as number} label={`vs £${CPS_BENCHMARK.toFixed(2)} benchmark`} />,
    },
    {
      key:    'trendFit',
      label:  'Trend Fit',
      width:  90,
      align:  'center' as const,
      render: (value: unknown) => (
        <span style={{
          ...typography.scale['body/sm/semi'],
          fontVariantNumeric: 'tabular-nums',
          color: trendFitColour(value as number),
        }}>
          {value as number}
        </span>
      ),
    },
    {
      key:    'guardrailPass',
      label:  'Guardrails',
      width:  110,
      render: (value: unknown) => (
        <StatusIndicator status={value ? 'success' : 'error'} label={value ? 'Pass' : 'Fail'} />
      ),
    },
    {
      key:    'supplyRisk',
      label:  'Supply',
      width:  110,
      render: (value: unknown) => (
        <StatusIndicator
          status={supplyStatus(value as CpsVariant['supplyRisk'])}
          label={`${String(value).charAt(0).toUpperCase() + String(value).slice(1)} risk`}
        />
      ),
    },
  ]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CpsVariantManagerPage() {
  const router = useRouter()

  const [activeNav,     setActiveNav]     = useState('pool')
  const [variants,      setVariants]      = useState<CpsVariant[]>(INITIAL_VARIANTS)
  const [expandedKeys,  setExpandedKeys]  = useState<Set<string | number>>(new Set())
  const [sheetOpen,     setSheetOpen]     = useState(false)
  const [newName,       setNewName]       = useState('')
  const [newChangeType, setNewChangeType] = useState('ingredient-swap')
  const [newReason,     setNewReason]     = useState('')

  const columns   = buildColumns(variants)
  const tableData = variants.map(v => ({
    id:            v.id,
    name:          v.name,
    changeType:    v.changeType,
    deltaVsBase:   v.deltaVsBase,
    deltaVsCps:    v.deltaVsCps,
    trendFit:      v.trendFit,
    guardrailPass: v.guardrailPass,
    supplyRisk:    v.supplyRisk,
  })) as Record<string, unknown>[]

  const openSheet = () => {
    setNewName(''); setNewChangeType('ingredient-swap'); setNewReason('')
    setSheetOpen(true)
  }

  const addVariant = () => {
    if (!newName.trim()) return
    setVariants(prev => [...prev, {
      id:            `v${Date.now()}`,
      name:          newName.trim(),
      changeType:    newChangeType as ChangeType,
      changeSummary: newReason.trim() || 'No description provided',
      deltaVsBase:   0,
      deltaVsCps:    -(CPS_BENCHMARK - BASE_COST),
      trendFit:      BASE_RECIPE.trendFit,
      guardrailPass: true,
      supplyRisk:    'low',
      diff:          [],
    }])
    setSheetOpen(false)
  }

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
          title="Variant Manager"
          subtitle="Compare variants against the base recipe and CPS benchmark before saving to the pool"
          primary={
            <Button variant="fill" color="positive" size="md"
              onClick={() => router.push('/tools/recipe-creator-cps/pool')}>
              Save to Pool
            </Button>
          }
          secondary={
            <Button variant="outline" color="neutral" size="md"
              onClick={() => router.push('/tools/recipe-creator-cps/builder')}>
              Back to Builder
            </Button>
          }
        />

        <Stack gap={600}>

          {/* ── Base recipe card ─────────────────────────────────────── */}
          <Section title="Base Recipe" surface="section">
            <Cluster gap={800} wrap={false}>
              <FieldReadOnly label="Recipe name"      value={BASE_RECIPE.name}     />
              <FieldReadOnly label="Cost / portion"   value={BASE_RECIPE.cost}     />
              <FieldReadOnly label="CPS benchmark"    value={BASE_RECIPE.cpsBench} />
              <FieldReadOnly label="Trend Fit"
                value={
                  <span style={{
                    ...typography.scale['body/sm/regular'],
                    fontVariantNumeric: 'tabular-nums',
                    color: trendFitColour(BASE_RECIPE.trendFit),
                  }}>
                    {BASE_RECIPE.trendFit} / 100
                  </span>
                }
              />
              <FieldReadOnly label="Main protein"   value={BASE_RECIPE.protein} />
              <FieldReadOnly label="Dietary type"   value={BASE_RECIPE.dietary} />
            </Cluster>
          </Section>

          {/* ── Variants list ─────────────────────────────────────────── */}
          <Section
            title="Variants"
            surface="section"
            action={
              <Button variant="outline" color="neutral" size="sm"
                showLeadingIcon leadingIcon={<AddOutline />}
                onClick={openSheet}>
                Add Variant
              </Button>
            }
          >
            <Table
              columns={columns}
              data={tableData}
              rowKey="id"
              size="comfortable"
              expandedKeys={expandedKeys}
              onExpandChange={setExpandedKeys}
              expandedContent={row => {
                const v = variants.find(x => x.id === row.id)
                return v ? <VariantDiff variant={v} /> : null
              }}
              emptyMessage="No variants yet — click Add Variant to create the first one."
            />
          </Section>

        </Stack>
      </PageContent>

      {/* ── Add Variant SideSheet ─────────────────────────────────────── */}
      <SideSheet
        open={sheetOpen}
        title="Add a variant"
        subtitle="Describe what changes in this version of the recipe"
        showCloseButton
        onClose={() => setSheetOpen(false)}
        showActions
        primaryAction={{ label: 'Add variant', onClick: addVariant }}
        secondaryAction={{ label: 'Cancel',     onClick: () => setSheetOpen(false) }}
      >
        <Stack gap={400}>
          <InputField
            label="Variant name"
            placeholder="e.g. Hemp Seed Swap"
            value={newName}
            onChange={setNewName}
            required
          />
          <DropdownField
            label="Type of change"
            options={CHANGE_TYPE_OPTIONS}
            value={newChangeType}
            onChange={v => setNewChangeType(v as string)}
          />
          <TextArea
            label="What changes and why?"
            placeholder="Describe the ingredient swap, portion adjustment, or method change — and how it affects the CPS score…"
            value={newReason}
            onChange={setNewReason}
            rows={4}
          />
        </Stack>
      </SideSheet>
    </PageShell>
  )
}
