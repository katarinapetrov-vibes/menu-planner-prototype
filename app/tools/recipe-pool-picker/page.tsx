'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PageShell,
  PageContent,
  PageHeader,
  PageToolbar,
  Stack,
  Cluster,
  KpiRow,
  Section,
  SectionHeader,
  BodyText,
  MetaText,
  Surface,
} from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import type { SideNavGroup, SideNavUser } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { KPIData } from '@/components/ui/kpi-data'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { Alert } from '@/components/ui/alert'
import { DropdownField } from '@/components/ui/dropdown-field'
import { SideSheet } from '@/components/ui/side-sheet'
import { InputField } from '@/components/ui/input-field'
import {
  DashboardOutline,
  SwapHorizOutline,
  WarningOutline,
  CheckCircleOutline,
  ErrorOutline,
  SearchOutline,
} from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { semantic, spacing } from '@/lib/tokens'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const navGroups: SideNavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Menu Overview', icon: <DashboardOutline />, href: '/tools/recipe-pool-picker' },
    ],
  },
]

const navUser: SideNavUser = {
  name: 'Anna Fischer', role: 'Menu Planner', email: 'anna.fischer@hellofresh.com',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SlotHealth = 'ok' | 'warning' | 'error'

interface RecipeSlot {
  id: string
  slotLabel: string
  recipeName: string
  cuisine: string
  costPerServing: string
  constraintStatus: SlotHealth
  skuStatus: SlotHealth
  constraintNote?: string
  skuNote?: string
}

interface ProteinGroup {
  label: string
  slots: RecipeSlot[]
}

type CandidateConstraint = 'ok' | 'warning' | 'error'
type CandidateSku        = 'ok' | 'warning' | 'error'

interface PoolCandidate {
  id: string
  name: string
  protein: string
  cuisine: string
  costPerServing: string
  costDelta: string
  costDeltaDir: 'up' | 'down' | 'neutral'
  constraintStatus: CandidateConstraint
  skuStatus: CandidateSku
  constraintNote?: string
  skuNote?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const WEEK_OPTIONS = [
  { label: 'W28 2026 (Jul 7–13)',     value: 'w28' },
  { label: 'W29 2026 (Jul 14–20)',    value: 'w29' },
  { label: 'W30 2026 (Jul 21–27)',    value: 'w30' },
  { label: 'W31 2026 (Jul 28–Aug 3)', value: 'w31' },
]

const PROTEIN_GROUPS: ProteinGroup[] = [
  {
    label: 'Beef',
    slots: [
      { id: 's1', slotLabel: 'Slot 1', recipeName: 'Korean BBQ Beef Bowl',   cuisine: 'Korean',           costPerServing: '€4.82', constraintStatus: 'ok',      skuStatus: 'ok' },
      { id: 's2', slotLabel: 'Slot 2', recipeName: 'Beef Stroganoff Pasta',  cuisine: 'Eastern European', costPerServing: '€5.14', constraintStatus: 'warning', skuStatus: 'ok',    constraintNote: 'Calorie-smart target borderline (±12 kcal)' },
      { id: 's3', slotLabel: 'Slot 3', recipeName: 'Tex-Mex Beef Tacos',     cuisine: 'Mexican',          costPerServing: '€4.45', constraintStatus: 'ok',      skuStatus: 'error', skuNote: 'Avocado SKU capped — 3 versions affected' },
    ],
  },
  {
    label: 'Chicken',
    slots: [
      { id: 's4', slotLabel: 'Slot 4', recipeName: 'Chicken Tikka Masala',     cuisine: 'Indian',        costPerServing: '€4.10', constraintStatus: 'ok', skuStatus: 'ok' },
      { id: 's5', slotLabel: 'Slot 5', recipeName: 'Lemon Herb Roast Chicken', cuisine: 'Mediterranean', costPerServing: '€3.92', constraintStatus: 'ok', skuStatus: 'ok' },
    ],
  },
  {
    label: 'Fish & Seafood',
    slots: [
      { id: 's6', slotLabel: 'Slot 6', recipeName: 'Teriyaki Salmon Rice Bowl', cuisine: 'Japanese', costPerServing: '€5.60', constraintStatus: 'error',   skuStatus: 'warning', constraintNote: 'Exceeds weekly fish protein cap by 1 slot', skuNote: 'Salmon SKU availability at 74%' },
      { id: 's7', slotLabel: 'Slot 7', recipeName: 'Garlic Prawn Linguine',     cuisine: 'Italian',  costPerServing: '€5.30', constraintStatus: 'ok',      skuStatus: 'ok' },
    ],
  },
  {
    label: 'Vegetarian',
    slots: [
      { id: 's8', slotLabel: 'Slot 8', recipeName: 'Mushroom & Spinach Risotto',  cuisine: 'Italian',       costPerServing: '€3.55', constraintStatus: 'ok',      skuStatus: 'ok' },
      { id: 's9', slotLabel: 'Slot 9', recipeName: 'Halloumi & Roasted Veg Wrap', cuisine: 'Mediterranean',  costPerServing: '€3.80', constraintStatus: 'warning', skuStatus: 'ok', constraintNote: 'Vegetarian slot target: 3 required, currently 2' },
    ],
  },
  {
    label: 'Pork',
    slots: [
      { id: 's10', slotLabel: 'Slot 10', recipeName: 'Pulled Pork Burger', cuisine: 'American', costPerServing: '€4.20', constraintStatus: 'ok', skuStatus: 'ok' },
    ],
  },
]

// Pool candidates shown in the SideSheet — filtered to same protein as the swapped slot
const POOL_CANDIDATES: PoolCandidate[] = [
  { id: 'p1', name: 'Smoky Beef Chilli',         protein: 'Beef', cuisine: 'American',  costPerServing: '€4.20', costDelta: '−€0.25', costDeltaDir: 'down',    constraintStatus: 'ok',      skuStatus: 'ok' },
  { id: 'p2', name: 'Beef & Mushroom Stir Fry',  protein: 'Beef', cuisine: 'Asian',     costPerServing: '€4.55', costDelta: '+€0.10', costDeltaDir: 'up',      constraintStatus: 'ok',      skuStatus: 'ok' },
  { id: 'p3', name: 'Beef Ragu Pappardelle',      protein: 'Beef', cuisine: 'Italian',  costPerServing: '€5.00', costDelta: '+€0.55', costDeltaDir: 'up',      constraintStatus: 'warning', skuStatus: 'ok', constraintNote: 'Calorie-smart borderline' },
  { id: 'p4', name: 'Classic Beef Burger',        protein: 'Beef', cuisine: 'American', costPerServing: '€4.30', costDelta: '−€0.15', costDeltaDir: 'down',    constraintStatus: 'ok',      skuStatus: 'ok' },
  { id: 'p5', name: 'Beef Bibimbap Bowl',         protein: 'Beef', cuisine: 'Korean',   costPerServing: '€4.80', costDelta: '+€0.35', costDeltaDir: 'up',      constraintStatus: 'ok',      skuStatus: 'warning', skuNote: 'Gochujang SKU at 68%' },
  { id: 'p6', name: 'Beef & Broccoli Noodles',   protein: 'Beef', cuisine: 'Asian',     costPerServing: '€4.10', costDelta: '−€0.35', costDeltaDir: 'down',    constraintStatus: 'ok',      skuStatus: 'ok' },
]

// ─── KPI derivations ──────────────────────────────────────────────────────────

const allSlots             = PROTEIN_GROUPS.flatMap(g => g.slots)
const constraintViolations = allSlots.filter(s => s.constraintStatus === 'error').length
const constraintWarnings   = allSlots.filter(s => s.constraintStatus === 'warning').length
const skuErrors            = allSlots.filter(s => s.skuStatus === 'error').length
const skuWarnings          = allSlots.filter(s => s.skuStatus === 'warning').length
const totalSlots           = allSlots.length
const canSubmit            = constraintViolations === 0 && skuErrors === 0

function slotToStatus(h: SlotHealth): 'success' | 'warning' | 'error' {
  return h === 'ok' ? 'success' : h === 'warning' ? 'warning' : 'error'
}

function deltaColour(dir: 'up' | 'down' | 'neutral') {
  return dir === 'down' ? semantic.foreground.positive.default.light
    : dir === 'up'   ? semantic.foreground.negative.default.light
    : semantic.foreground.default.secondary.light
}

// ─── MenuSlotCard ─────────────────────────────────────────────────────────────
// @temporary component:MenuSlotCard reason:no DS card variant for recipe slot with dual-signal layout owner:kat

interface MenuSlotCardProps {
  slot: RecipeSlot
  onSwap: (slot: RecipeSlot) => void
  onViewDetail: (slotId: string) => void
}

function MenuSlotCard({ slot, onSwap, onViewDetail }: MenuSlotCardProps) {
  // @temporary component:MenuSlotCard reason:no DS card variant for recipe slot with dual-signal layout owner:kat
  const hasError   = slot.constraintStatus === 'error'   || slot.skuStatus === 'error'
  const hasWarning = slot.constraintStatus === 'warning' || slot.skuStatus === 'warning'

  return (
    <Surface
      tier="raised"
      padding={400}
      style={{
        display: 'flex', flexDirection: 'column', gap: spacing[300],
        borderLeft: hasError   ? `3px solid ${semantic.border.negative.light}`
          : hasWarning ? `3px solid ${semantic.border.warning.light}`
          : `3px solid transparent`,
      }}
    >
      <Cluster justify="space-between" align="flex-start" wrap={false}>
        <MetaText emphasis="tertiary">{slot.slotLabel}</MetaText>
        <MetaText emphasis="tertiary" style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {slot.costPerServing}
        </MetaText>
      </Cluster>

      <button
        onClick={() => onViewDetail(slot.id)}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline', color: semantic.foreground.default.primary.light }}
      >
        <BodyText density="compact" weight="semi" style={{ lineHeight: '1.4' }}>{slot.recipeName}</BodyText>
      </button>

      <MetaText emphasis="secondary">{slot.cuisine}</MetaText>

      <Stack gap={100}>
        <StatusIndicator status={slotToStatus(slot.constraintStatus)} label={slot.constraintStatus === 'ok' ? 'Constraints met' : slot.constraintNote ?? 'Constraint issue'} />
        <StatusIndicator status={slotToStatus(slot.skuStatus)}        label={slot.skuStatus        === 'ok' ? 'SKUs healthy'   : slot.skuNote        ?? 'SKU issue'} />
      </Stack>

      <Button
        variant="outline" color="neutral" size="sm"
        showLeadingIcon leadingIcon={<SwapHorizOutline />}
        onClick={() => onSwap(slot)}
        style={{ alignSelf: 'flex-start', marginTop: spacing[100] }}
      >
        Swap
      </Button>
    </Surface>
  )
}

// ─── RecipePickerSideSheet ────────────────────────────────────────────────────

interface RecipePickerSideSheetProps {
  open: boolean
  slot: RecipeSlot | null
  onClose: () => void
  onSelect: (candidate: PoolCandidate, slot: RecipeSlot) => void
}

function RecipePickerSideSheet({ open, slot, onClose, onSelect }: RecipePickerSideSheetProps) {
  const [search, setSearch] = useState('')

  if (!slot) return null

  const filtered = POOL_CANDIDATES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cuisine.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SideSheet
      open={open}
      title="Swap Recipe"
      subtitle={
        <MetaText emphasis="tertiary">
          Replacing: {slot.slotLabel} · {slot.recipeName} · {slot.costPerServing}
        </MetaText>
      }
      showCloseButton
      onClose={onClose}
      showActions={false}
    >
      <Stack gap={400}>
        {/* Search */}
        <InputField
          placeholder="Search by name or cuisine…"
          value={search}
          onChange={setSearch}
          size="sm"
          leadingIcon={<SearchOutline />}
        />

        {/* Candidate count */}
        <SectionHeader
          title={`${filtered.length} candidate${filtered.length !== 1 ? 's' : ''}`}
          level="secondary"
        />

        {/* Candidate rows */}
        <Stack gap={300}>
          {filtered.length === 0 && (
            <MetaText emphasis="tertiary">No recipes match your search.</MetaText>
          )}
          {filtered.map(c => (
            <Surface
              key={c.id}
              tier="raised"
              padding={400}
              style={{ display: 'flex', flexDirection: 'column', gap: spacing[300] }}
            >
              {/* Name + cost delta */}
              <Cluster justify="space-between" align="flex-start" wrap={false}>
                <Stack gap={50}>
                  <BodyText density="compact" weight="semi">{c.name}</BodyText>
                  <MetaText emphasis="tertiary">{c.cuisine}</MetaText>
                </Stack>
                <Stack gap={50} style={{ textAlign: 'right', flexShrink: 0 }}>
                  <BodyText density="compact" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {c.costPerServing}
                  </BodyText>
                  <MetaText
                    emphasis={c.costDeltaDir === 'down' ? 'positive' : c.costDeltaDir === 'up' ? 'negative' : 'tertiary'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {c.costDelta} vs current
                  </MetaText>
                </Stack>
              </Cluster>

              {/* Signals */}
              <Cluster gap={300} wrap>
                <StatusIndicator
                  status={c.constraintStatus === 'ok' ? 'success' : c.constraintStatus === 'warning' ? 'warning' : 'error'}
                  label={c.constraintStatus === 'ok' ? 'Constraints met' : c.constraintNote ?? 'Constraint issue'}
                />
                <StatusIndicator
                  status={c.skuStatus === 'ok' ? 'success' : c.skuStatus === 'warning' ? 'warning' : 'error'}
                  label={c.skuStatus === 'ok' ? 'SKUs healthy' : c.skuNote ?? 'SKU issue'}
                />
              </Cluster>

              {/* Select action */}
              <Button
                variant="fill" color="positive" size="sm"
                onClick={() => onSelect(c, slot)}
                style={{ alignSelf: 'flex-start' }}
              >
                Select
              </Button>
            </Surface>
          ))}
        </Stack>
      </Stack>
    </SideSheet>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuOverviewPage() {
  const router = useRouter()
  const [activeNav, setActiveNav]             = useState('overview')
  const [selectedWeek, setSelectedWeek]       = useState('w28')
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0].value)
  const [swapSlot, setSwapSlot]               = useState<RecipeSlot | null>(null)
  const [swappedSlots, setSwappedSlots]       = useState<Record<string, string>>({})

  function handleSwap(slot: RecipeSlot)       { setSwapSlot(slot) }
  function handleCloseSheet()                 { setSwapSlot(null) }
  function handleViewDetail(slotId: string)   { router.push(`/tools/recipe-pool-picker/recipe/${slotId}`) }

  function handleSelectCandidate(candidate: PoolCandidate, slot: RecipeSlot) {
    setSwappedSlots(prev => ({ ...prev, [slot.id]: candidate.name }))
    setSwapSlot(null)
  }

  const weekLabel = WEEK_OPTIONS.find(w => w.value === selectedWeek)?.label ?? ''

  // Merge swapped names into slot data for display
  const proteinGroupsWithSwaps = PROTEIN_GROUPS.map(group => ({
    ...group,
    slots: group.slots.map(slot => ({
      ...slot,
      recipeName: swappedSlots[slot.id] ?? slot.recipeName,
    })),
  }))

  return (
    <PageShell
      sidebar={<SideNavigation groups={navGroups} activeId={activeNav} onItemClick={(id) => setActiveNav(id)} user={navUser} theme="dark" />}
      header={<Header title="Recipe Pool Picker" countryDropdown={{ value: selectedCountry, options: countryOptions, onChange: (v) => setSelectedCountry(v) }} />}
    >
      <PageToolbar>
        <Cluster gap={300} align="center" wrap={false}>
          <MetaText emphasis="secondary" style={{ whiteSpace: 'nowrap' }}>Planning week</MetaText>
          <DropdownField options={WEEK_OPTIONS} value={selectedWeek} onChange={(v) => setSelectedWeek(v as string)} placeholder="Select week" size="sm" />
        </Cluster>
        <div style={{ flex: 1 }} />
        <Cluster gap={400} align="center" wrap={false}>
          {constraintViolations > 0 && (
            <Cluster gap={200} align="center" wrap={false}>
              <span className="text-red-500"><ErrorOutline size={16} /></span>
              <MetaText emphasis="negative">{constraintViolations} constraint violation{constraintViolations !== 1 ? 's' : ''}</MetaText>
            </Cluster>
          )}
          {skuErrors > 0 && (
            <Cluster gap={200} align="center" wrap={false}>
              <span className="text-orange-500"><WarningOutline size={16} /></span>
              <MetaText emphasis="secondary">{skuErrors} SKU issue{skuErrors !== 1 ? 's' : ''}</MetaText>
            </Cluster>
          )}
          {constraintViolations === 0 && skuErrors === 0 && (
            <Cluster gap={200} align="center" wrap={false}>
              <span className="text-emerald-500"><CheckCircleOutline size={16} /></span>
              <MetaText emphasis="positive">Ready to submit</MetaText>
            </Cluster>
          )}
        </Cluster>
      </PageToolbar>

      <PageContent>
        <PageHeader
          title="Menu Overview"
          subtitle={`GAMP output · ${weekLabel}`}
          primary={<Button variant="fill" color={canSubmit ? 'positive' : 'neutral'} size="md" disabled={!canSubmit}>Submit to MPS</Button>}
          secondary={<Button variant="outline" color="neutral" size="md">Export</Button>}
        />

        <Stack gap={800}>
          <KpiRow>
            <KPIData label="COGS vs target" value={<span style={{ fontVariantNumeric: 'tabular-nums' }}>€4.42 <MetaText emphasis="positive">↓ €0.08</MetaText></span>} />
            <KPIData label="Constraint violations" value={<span style={{ fontVariantNumeric: 'tabular-nums', color: constraintViolations > 0 ? semantic.foreground.negative.default.light : semantic.foreground.positive.default.light }}>{String(constraintViolations)}{constraintWarnings > 0 && <MetaText emphasis="secondary">{` (${constraintWarnings} warnings)`}</MetaText>}</span>} />
            <KPIData label="SKU issues"            value={<span style={{ fontVariantNumeric: 'tabular-nums', color: skuErrors > 0 ? semantic.foreground.negative.default.light : skuWarnings > 0 ? semantic.foreground.warning.default.light : semantic.foreground.positive.default.light }}>{String(skuErrors)}{skuWarnings > 0 && <MetaText emphasis="secondary">{` (${skuWarnings} monitoring)`}</MetaText>}</span>} />
            <KPIData label="Slot fill rate"        value={<span style={{ fontVariantNumeric: 'tabular-nums', color: semantic.foreground.positive.default.light }}>{`${totalSlots}/${totalSlots}`}</span>} />
          </KpiRow>

          {(constraintViolations > 0 || skuErrors > 0) && (
            <Alert alertColour="warning" showTitle title={constraintViolations > 0 ? `${constraintViolations} constraint violation${constraintViolations !== 1 ? 's' : ''} must be resolved before submitting to MPS` : `${skuErrors} SKU issue${skuErrors !== 1 ? 's' : ''} require attention`} showDescription description="Slots with a red or amber left border need action." />
          )}

          {proteinGroupsWithSwaps.map((group) => (
            <Section key={group.label} title={group.label} surface="section">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: spacing[400] }}>
                {group.slots.map((slot) => (
                  <MenuSlotCard key={slot.id} slot={slot} onSwap={handleSwap} onViewDetail={handleViewDetail} />
                ))}
              </div>
            </Section>
          ))}
        </Stack>
      </PageContent>

      {/* Recipe Picker SideSheet */}
      <RecipePickerSideSheet
        open={swapSlot !== null}
        slot={swapSlot}
        onClose={handleCloseSheet}
        onSelect={handleSelectCandidate}
      />
    </PageShell>
  )
}
