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
  Surface,
  BodyText,
  MetaText,
  FieldReadOnly,
  Divider,
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
  BookForkKnifeOutline,
  AddOutline,
  ArrowDownwardOutline,
  ArrowUpwardOutline,
  CheckCircleOutline,
  ErrorOutline,
} from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { semantic, spacing, typography } from '@/lib/tokens'

// ─── Nav config ───────────────────────────────────────────────────────────────

const navGroups: SideNavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'pool', label: 'Recipe Creator', icon: <BookForkKnifeOutline />, href: '/tools/recipe-creator' },
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

interface Variant {
  id:           string
  name:         string
  changeType:   ChangeType
  changeSummary:string
  costDelta:    number   // £ vs base — negative = cheaper
  guardrailPass:boolean
  supplyRisk:   'low' | 'medium' | 'high'
  diff:         IngredientDiff[]
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const BASE_RECIPE = {
  name:    'Sesame Tofu Rice Bowl',
  cost:    '£3.42',
  protein: 'Plant',
  dietary: 'Vegan',
  rating:  '—',
}

const CHANGE_TYPE_OPTIONS = [
  { label: 'Ingredient swap',  value: 'ingredient-swap'  },
  { label: 'Portion change',   value: 'portion-change'   },
  { label: 'Method change',    value: 'method-change'    },
]

const INITIAL_VARIANTS: Variant[] = [
  {
    id:           'v1',
    name:         'Hemp Seed Swap',
    changeType:   'ingredient-swap',
    changeSummary:'Replace black sesame seeds with hemp seeds — lower cost, higher protein',
    costDelta:    -0.18,
    guardrailPass:true,
    supplyRisk:   'low',
    diff: [
      { ingredient: 'Seeds',   base: 'Black Sesame Seed 5g', variant: 'Hemp Seeds 5g' },
    ],
  },
  {
    id:           'v2',
    name:         'Larger Portion',
    changeType:   'portion-change',
    changeSummary:'Increase tofu to 250g and brown rice to 180g for a higher-calorie variant',
    costDelta:    +0.52,
    guardrailPass:false,
    supplyRisk:   'low',
    diff: [
      { ingredient: 'Firm Tofu',   base: '200g', variant: '250g' },
      { ingredient: 'Brown Rice',  base: '150g', variant: '180g' },
    ],
  },
  {
    id:           'v3',
    name:         'No Sesame Oil',
    changeType:   'ingredient-swap',
    changeSummary:'Replace sesame oil with neutral rapeseed oil — removes sesame allergen',
    costDelta:    -0.31,
    guardrailPass:true,
    supplyRisk:   'low',
    diff: [
      { ingredient: 'Oil', base: 'Sesame Oil 15ml', variant: 'Rapeseed Oil 15ml' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function supplyRiskStatus(risk: Variant['supplyRisk']): 'success' | 'warning' | 'error' {
  return risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error'
}

function CostDelta({ delta }: { delta: number }) {
  const positive = delta <= 0
  const color = positive
    ? semantic.foreground.positive.default.light
    : semantic.foreground.negative.default.light
  const icon = positive
    ? <ArrowDownwardOutline size={16} />
    : <ArrowUpwardOutline size={16} />
  const label = `${delta > 0 ? '+' : ''}£${Math.abs(delta).toFixed(2)} vs base`
  return (
    <Cluster gap={100} align="center">
      <span style={{ display: 'flex', color }}>{icon}</span>
      <span style={{
        ...typography.scale['body/sm/regular'],
        fontVariantNumeric: 'tabular-nums',
        color,
      }}>
        {label}
      </span>
    </Cluster>
  )
}

// ─── Expanded row content (inline diff) ──────────────────────────────────────

function VariantDiff({ variant }: { variant: Variant }) {
  return (
    <div style={{ padding: `${spacing[400]} ${spacing[600]}`, background: semantic.background.sunken.default.light }}>
      <Stack gap={300}>
        <SectionHeader title="Changes vs base recipe" level="secondary" />
        {variant.diff.map((d, i) => (
          <Cluster key={i} gap={600} align="center">
            <div style={{ width: 120, flexShrink: 0 }}>
              <MetaText emphasis="tertiary">{d.ingredient}</MetaText>
            </div>
            <Cluster gap={200} align="center">
              <MetaText emphasis="secondary" style={{ textDecoration: 'line-through' }}>{d.base}</MetaText>
              <span style={{ color: semantic.foreground.default.tertiary.light, fontSize: '12px' }}>→</span>
              <MetaText emphasis="positive">{d.variant}</MetaText>
            </Cluster>
          </Cluster>
        ))}
        <Cluster gap={400} style={{ paddingTop: spacing[200] }}>
          <StatusIndicator
            status={supplyRiskStatus(variant.supplyRisk)}
            label={`Supply: ${variant.supplyRisk} risk`}
          />
          <StatusIndicator
            status={variant.guardrailPass ? 'success' : 'error'}
            label={variant.guardrailPass ? 'Guardrails pass' : 'Guardrails fail'}
          />
        </Cluster>
      </Stack>
    </div>
  )
}

// ─── Table columns ────────────────────────────────────────────────────────────

function buildColumns(variants: Variant[]) {
  return [
    {
      key:    'expand',
      label:  '',
      headerType: 'chevron' as const,
      width:  40,
    },
    {
      key:     'name',
      label:   'Variant',
      sortable: true,
      minWidth: 180,
      render:  (value: unknown, row: Record<string, unknown>) => {
        const v = variants.find(x => x.id === row.id)
        return (
          <Stack gap={50}>
            <BodyText density="compact" weight="semi" as="span">{String(value)}</BodyText>
            <MetaText emphasis="tertiary">{v?.changeSummary.slice(0, 60)}…</MetaText>
          </Stack>
        )
      },
    },
    {
      key:   'changeType',
      label: 'Type',
      width: 150,
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
      key:   'costDelta',
      label: 'Cost delta',
      width: 160,
      align: 'right' as const,
      render: (value: unknown) => <CostDelta delta={value as number} />,
    },
    {
      key:   'guardrailPass',
      label: 'Guardrails',
      width: 130,
      render: (value: unknown) => (
        <StatusIndicator
          status={value ? 'success' : 'error'}
          label={value ? 'Pass' : 'Fail'}
        />
      ),
    },
    {
      key:   'supplyRisk',
      label: 'Supply',
      width: 120,
      render: (value: unknown) => (
        <StatusIndicator
          status={supplyRiskStatus(value as Variant['supplyRisk'])}
          label={`${String(value).charAt(0).toUpperCase() + String(value).slice(1)} risk`}
        />
      ),
    },
  ]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VariantManagerPage() {
  const router = useRouter()

  const [activeNav,    setActiveNav]    = useState('variants')
  const [variants,     setVariants]     = useState<Variant[]>(INITIAL_VARIANTS)
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(new Set())

  // SideSheet state
  const [sheetOpen,    setSheetOpen]    = useState(false)
  const [newName,      setNewName]      = useState('')
  const [newChangeType,setNewChangeType]= useState<string>('ingredient-swap')
  const [newReason,    setNewReason]    = useState('')

  const columns = buildColumns(variants)
  const tableData = variants.map(v => ({
    id:           v.id,
    name:         v.name,
    changeType:   v.changeType,
    costDelta:    v.costDelta,
    guardrailPass:v.guardrailPass,
    supplyRisk:   v.supplyRisk,
  })) as Record<string, unknown>[]

  const openSheet = () => {
    setNewName('')
    setNewChangeType('ingredient-swap')
    setNewReason('')
    setSheetOpen(true)
  }

  const addVariant = () => {
    if (!newName.trim()) return
    setVariants(prev => [
      ...prev,
      {
        id:           `v${Date.now()}`,
        name:         newName.trim(),
        changeType:   newChangeType as ChangeType,
        changeSummary:newReason.trim() || 'No description provided',
        costDelta:    0,
        guardrailPass:true,
        supplyRisk:   'low',
        diff:         [],
      },
    ])
    setSheetOpen(false)
  }

  return (
    <PageShell
      sidebar={
        <SideNavigation
          groups={navGroups}
          activeId={activeNav}
          onItemClick={(id) => setActiveNav(id)}
          user={navUser}
          theme="dark"
        />
      }
      header={
        <Header
          title="Recipe Creator"
          countryDropdown={{
            value:   countryOptions[0].value,
            options: countryOptions,
            onChange:() => {},
          }}
        />
      }
    >
      <PageContent>
        {/* ── Page header ──────────────────────────────────────────────── */}
        <PageHeader
          title="Variant Manager"
          subtitle="Compare recipe variants and save to the pool for testing"
          primary={
            <Button
              variant="fill"
              color="positive"
              size="md"
              onClick={() => router.push('/tools/recipe-creator')}
            >
              Save to Pool
            </Button>
          }
          secondary={
            <Button variant="outline" color="neutral" size="md"
              onClick={() => router.push('/tools/recipe-creator/builder')}>
              Back to Builder
            </Button>
          }
        />

        <Stack gap={600}>
          {/* ── Base recipe card ─────────────────────────────────────── */}
          <Section title="Base Recipe" surface="section">
            <Cluster gap={800} wrap={false}>
              <FieldReadOnly label="Recipe name" value={BASE_RECIPE.name} />
              <FieldReadOnly label="Cost / portion" value={BASE_RECIPE.cost} />
              <FieldReadOnly label="Main protein"   value={BASE_RECIPE.protein} />
              <FieldReadOnly label="Dietary type"   value={BASE_RECIPE.dietary} />
              <FieldReadOnly label="Rating target"  value={BASE_RECIPE.rating} />
            </Cluster>
          </Section>

          {/* ── Variants list ────────────────────────────────────────── */}
          <Section
            title="Variants"
            surface="section"
            action={
              <Button
                variant="outline"
                color="neutral"
                size="sm"
                showLeadingIcon
                leadingIcon={<AddOutline />}
                onClick={openSheet}
              >
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
              expandedContent={(row) => {
                const variant = variants.find(v => v.id === row.id)
                return variant ? <VariantDiff variant={variant} /> : null
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
        secondaryAction={{ label: 'Cancel',      onClick: () => setSheetOpen(false) }}
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
            onChange={(v) => setNewChangeType(v as string)}
          />
          <TextArea
            label="What changes and why?"
            placeholder="Describe the ingredient swap, portion adjustment, or method change and the reason for it…"
            value={newReason}
            onChange={setNewReason}
            rows={4}
          />
        </Stack>
      </SideSheet>
    </PageShell>
  )
}
