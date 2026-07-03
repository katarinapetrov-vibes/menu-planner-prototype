'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  PageShell,
  PageContent,
  PageHeader,
  SplitPane,
  Stack,
  Cluster,
  Section,
  SectionHeader,
  BodyText,
  MetaText,
  DataTable,
  Divider,
} from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import type { SideNavGroup, SideNavUser } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/input-field'
import { TextArea } from '@/components/ui/text-area'
import { DropdownField } from '@/components/ui/dropdown-field'
import { StatusIndicator } from '@/components/ui/status-indicator'
import {
  InsertChartOutline,
  TableChartOutline,
  EditOutline,
  AddOutline,
  DeleteOutline,
  CheckCircleOutline,
  ErrorOutline,
  ArrowDownwardOutline,
  ArrowUpwardOutline,
} from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { semantic, spacing, typography } from '@/lib/tokens'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const navGroups: SideNavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'intelligence', label: 'Menu Intelligence', icon: <InsertChartOutline />, href: '/tools/recipe-creator-cps'       },
      { id: 'pool',         label: 'Recipe Pool',       icon: <TableChartOutline />,  href: '/tools/recipe-creator-cps/pool'  },
    ],
  },
]

const navUser: SideNavUser = {
  name:  'Alex Müller',
  role:  'Recipe Developer',
  email: 'alex.muller@hellofresh.com',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ingredient {
  id:              string
  name:            string
  qty:             string
  unit:            string
  costPer:         number
  availability:    number   // 0–100%
  supplyRisk:      'low' | 'medium' | 'high'
  cpsFrequency:    number   // 0–100% — how often this ingredient appears in CPS recipes of same type
}

interface Guardrail {
  label:  string
  status: 'pass' | 'fail' | 'pending'
  source: 'CPS'
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'i1', name: 'Firm Tofu',         qty: '200', unit: 'g',  costPer: 0.008, availability: 92, supplyRisk: 'low',    cpsFrequency: 78 },
  { id: 'i2', name: 'Soy Sauce',         qty: '30',  unit: 'ml', costPer: 0.012, availability: 88, supplyRisk: 'low',    cpsFrequency: 91 },
  { id: 'i3', name: 'Sesame Oil',        qty: '15',  unit: 'ml', costPer: 0.035, availability: 74, supplyRisk: 'medium', cpsFrequency: 62 },
  { id: 'i4', name: 'Brown Rice',        qty: '150', unit: 'g',  costPer: 0.004, availability: 95, supplyRisk: 'low',    cpsFrequency: 85 },
  { id: 'i5', name: 'Spring Onion',      qty: '40',  unit: 'g',  costPer: 0.018, availability: 61, supplyRisk: 'medium', cpsFrequency: 54 },
  { id: 'i6', name: 'Black Sesame Seed', qty: '5',   unit: 'g',  costPer: 0.060, availability: 43, supplyRisk: 'high',   cpsFrequency: 23 },
]

const CPS_GUARDRAILS: Guardrail[] = [
  { label: 'Cost within CPS benchmark (≤ £4.50)',    status: 'pass',    source: 'CPS' },
  { label: 'Protein target met (≥ 25g) — CPS rule',  status: 'pass',    source: 'CPS' },
  { label: 'Allergens declared (soy, sesame)',        status: 'pending', source: 'CPS' },
  { label: 'Plant protein trend alignment',           status: 'pass',    source: 'CPS' },
  { label: 'Calorie range (400–700 kcal) — CPS band',status: 'pass',    source: 'CPS' },
  { label: 'Carbon footprint band (A–C) — CPS tier', status: 'pending', source: 'CPS' },
]

const CPS_BENCHMARK = 4.50

const PROTEIN_OPTIONS = [
  { label: 'Plant',   value: 'plant'   },
  { label: 'Chicken', value: 'chicken' },
  { label: 'Beef',    value: 'beef'    },
  { label: 'Pork',    value: 'pork'    },
  { label: 'Fish',    value: 'fish'    },
  { label: 'Seafood', value: 'seafood' },
  { label: 'Lamb',    value: 'lamb'    },
]

const DIETARY_OPTIONS = [
  { label: 'Vegan',       value: 'vegan'       },
  { label: 'Vegetarian',  value: 'vegetarian'  },
  { label: 'Gluten-Free', value: 'gluten-free' },
  { label: 'Dairy-Free',  value: 'dairy-free'  },
  { label: 'Standard',    value: 'standard'    },
]

const ALLERGEN_OPTIONS = [
  { label: 'Gluten',    value: 'gluten'    },
  { label: 'Dairy',     value: 'dairy'     },
  { label: 'Eggs',      value: 'eggs'      },
  { label: 'Soy',       value: 'soy'       },
  { label: 'Sesame',    value: 'sesame'    },
  { label: 'Nuts',      value: 'nuts'      },
  { label: 'Fish',      value: 'fish'      },
  { label: 'Shellfish', value: 'shellfish' },
]

// Pre-populated seed data per creation method — same pattern as Prototype A
const SEED_BY_METHOD: Record<string, {
  name: string; description: string; protein: string
  dietary: string; allergens: string[]; ingredients: Ingredient[]
}> = {
  scratch: { name: '', description: '', protein: '', dietary: '', allergens: [], ingredients: [] },
  brief: {
    name: 'High-Protein Plant Bowl', description: '', protein: 'plant', dietary: 'vegan',
    allergens: [], ingredients: [
      { id: 'b1', name: 'Chickpeas', qty: '120', unit: 'g', costPer: 0.005, availability: 95, supplyRisk: 'low', cpsFrequency: 72 },
      { id: 'b2', name: 'Quinoa',    qty: '80',  unit: 'g', costPer: 0.012, availability: 88, supplyRisk: 'low', cpsFrequency: 68 },
    ],
  },
  ai: {
    name: 'Sesame Tofu Rice Bowl',
    description: 'A light, high-protein plant-based bowl with nutty sesame notes and fluffy brown rice.',
    protein: 'plant', dietary: 'vegan', allergens: ['soy', 'sesame'],
    ingredients: INITIAL_INGREDIENTS,
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcLineCost(ing: Ingredient): number {
  return parseFloat(ing.qty || '0') * ing.costPer
}

function calcTotalCost(ingredients: Ingredient[]): number {
  return ingredients.reduce((sum, ing) => sum + calcLineCost(ing), 0)
}

function calcTrendFit(ingredients: Ingredient[]): number {
  if (!ingredients.length) return 0
  const avg = ingredients.reduce((sum, i) => sum + i.cpsFrequency, 0) / ingredients.length
  return Math.round(avg)
}

function trendFitColour(score: number): string {
  if (score >= 70) return semantic.foreground.positive.default.light
  if (score >= 50) return semantic.foreground.warning.default.light
  return semantic.foreground.negative.default.light
}

function freqColour(freq: number): string {
  if (freq >= 70) return semantic.foreground.positive.default.light
  if (freq >= 40) return semantic.foreground.warning.default.light
  return semantic.foreground.negative.default.light
}

function supplyStatus(risk: Ingredient['supplyRisk']): 'success' | 'warning' | 'error' {
  return risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error'
}

// ─── Guardrail row ────────────────────────────────────────────────────────────

function GuardrailRow({ item }: { item: Guardrail }) {
  const iconStyle: React.CSSProperties = { display: 'flex', flexShrink: 0 }
  const icon = item.status === 'pass'
    ? <span style={{ ...iconStyle, color: semantic.foreground.positive.default.light }}><CheckCircleOutline size={16} /></span>
    : item.status === 'fail'
    ? <span style={{ ...iconStyle, color: semantic.foreground.negative.default.light }}><ErrorOutline size={16} /></span>
    : <span style={{ ...iconStyle, color: semantic.foreground.warning.default.light }}><ErrorOutline size={16} /></span>

  return (
    <Cluster gap={200} align="center" style={{ paddingTop: spacing[100], paddingBottom: spacing[100] }}>
      {icon}
      <Stack gap={0}>
        <MetaText emphasis={item.status === 'fail' ? 'negative' : item.status === 'pass' ? 'positive' : 'secondary'}>
          {item.label}
        </MetaText>
        <MetaText emphasis="tertiary">Source: {item.source}</MetaText>
      </Stack>
    </Cluster>
  )
}

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function RecipeBuilderCpsInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const method       = searchParams.get('method') ?? 'scratch'
  const aiPrompt     = searchParams.get('prompt') ?? ''
  const gapProtein   = searchParams.get('protein') ?? ''
  const gapDietary   = searchParams.get('dietary') ?? ''

  const seed = useMemo(() => SEED_BY_METHOD[method] ?? SEED_BY_METHOD.scratch, [method])

  const [activeNav,    setActiveNav]    = useState('pool')
  const [recipeName,   setRecipeName]   = useState(seed.name)
  const [description,  setDescription]  = useState(
    method === 'ai' && aiPrompt ? `AI-generated from: "${aiPrompt}"` : seed.description
  )
  const [cookingMethod, setCookingMethod] = useState('')
  const [mainProtein,  setMainProtein]  = useState(gapProtein ? gapProtein.toLowerCase() : seed.protein)
  const [dietaryType,  setDietaryType]  = useState(gapDietary ? gapDietary.toLowerCase() : seed.dietary)
  const [allergens,    setAllergens]    = useState<string[]>(seed.allergens)
  const [ingredients,  setIngredients]  = useState<Ingredient[]>(seed.ingredients)

  const removeIngredient = (id: string) =>
    setIngredients(prev => prev.filter(i => i.id !== id))

  const addIngredientRow = () =>
    setIngredients(prev => [
      ...prev,
      { id: `i${Date.now()}`, name: '', qty: '', unit: 'g', costPer: 0, availability: 100, supplyRisk: 'low', cpsFrequency: 0 },
    ])

  const totalCost  = calcTotalCost(ingredients)
  const cpsDelta   = totalCost - CPS_BENCHMARK
  const belowBench = cpsDelta <= 0
  const trendFit   = calcTrendFit(ingredients)

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
          title="Recipe Builder"
          subtitle="Build your recipe — CPS market context updates live as you add ingredients"
          primary={
            <Button variant="fill" color="positive" size="md"
              onClick={() => router.push('/tools/recipe-creator-cps/pool')}>
              Save to Pool
            </Button>
          }
          secondary={
            <Button variant="outline" color="neutral" size="md"
              onClick={() => router.push('/tools/recipe-creator-cps/variants')}>
              Create Variants
            </Button>
          }

          ghost={
            <Button variant="text" color="neutral" size="md">
              Save Draft
            </Button>
          }
        />

        {/* Source banner */}
        {(method !== 'scratch' || gapProtein) && (
          <Cluster gap={200} align="center" style={{
            padding: `${spacing[200]} ${spacing[400]}`,
            background: semantic.background.information.defaultSubtle.light,
            borderRadius: '8px',
          }}>
            <MetaText emphasis="secondary">
              {gapProtein
                ? `Pre-filled from CPS gap: ${gapProtein} · ${gapDietary}`
                : method === 'ai'
                ? `AI-generated${aiPrompt ? ` from: "${aiPrompt}"` : ''}`
                : 'Started from a brief template'}
            </MetaText>
          </Cluster>
        )}

        <SplitPane ratio="2:1" gap={600}>

          {/* ════ LEFT — Recipe Form ════ */}
          <Stack gap={600}>

            <Section title="Recipe Details" surface="section" gap={400}>
              <InputField
                label="Recipe name"
                value={recipeName}
                onChange={setRecipeName}
                layout="horizontal"
                required
              />
              <TextArea
                label="Description"
                value={description}
                onChange={setDescription}
                rows={3}
                placeholder="Short description that will appear in the recipe pool"
              />
              <Cluster gap={400} wrap={false}>
                <div style={{ flex: 1 }}>
                  <DropdownField
                    label="Main protein"
                    options={PROTEIN_OPTIONS}
                    value={mainProtein}
                    onChange={v => setMainProtein(v as string)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <DropdownField
                    label="Dietary type"
                    options={DIETARY_OPTIONS}
                    value={dietaryType}
                    onChange={v => setDietaryType(v as string)}
                  />
                </div>
              </Cluster>
              <DropdownField
                label="Allergens"
                options={ALLERGEN_OPTIONS}
                value={allergens}
                onChange={v => setAllergens(v as string[])}
                multi
                placeholder="Select all that apply"
              />
            </Section>

            <Section title="Ingredients" surface="section" gap={400}>
              <DataTable density="compact">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Ingredient</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>Qty</th>
                    <th style={{ width: '8%' }}>Unit</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Cost</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Avail.</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>CPS Freq.</th>
                    <th style={{ width: '40px' }} />
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map(ing => {
                    const lineCost = calcLineCost(ing)
                    return (
                      <tr key={ing.id}>
                        <td>
                          <BodyText density="compact" weight="semi" as="span">
                            {ing.name || <MetaText emphasis="tertiary">Enter ingredient…</MetaText>}
                          </BodyText>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ ...typography.scale['body/sm/regular'], fontVariantNumeric: 'tabular-nums', color: semantic.foreground.default.primary.light }}>
                            {ing.qty}
                          </span>
                        </td>
                        <td><MetaText emphasis="secondary">{ing.unit}</MetaText></td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ ...typography.scale['body/sm/regular'], fontVariantNumeric: 'tabular-nums', color: semantic.foreground.default.primary.light }}>
                            £{lineCost.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ ...typography.scale['body/sm/regular'], fontVariantNumeric: 'tabular-nums', color: ing.availability >= 80 ? semantic.foreground.positive.default.light : ing.availability >= 50 ? semantic.foreground.warning.default.light : semantic.foreground.negative.default.light }}>
                            {ing.availability}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ ...typography.scale['body/sm/regular'], fontVariantNumeric: 'tabular-nums', color: freqColour(ing.cpsFrequency) }}>
                            {ing.cpsFrequency}%
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            aria-label={`Remove ${ing.name}`}
                            onClick={() => removeIngredient(ing.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: spacing[100], color: semantic.foreground.default.tertiary.light }}
                          >
                            <DeleteOutline size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </DataTable>
              <Button variant="outline" color="neutral" size="sm" showLeadingIcon leadingIcon={<AddOutline />} onClick={addIngredientRow}>
                Add ingredient
              </Button>
            </Section>

            <Section title="Method & Instructions" surface="section" gap={400}>
              <TextArea
                label="Cooking method"
                value={cookingMethod}
                onChange={setCookingMethod}
                rows={6}
                placeholder="Step-by-step preparation and cooking instructions…"
              />
            </Section>

          </Stack>

          {/* ════ RIGHT — CPS Market Context Panel ════ */}
          <Stack gap={500}>

            {/* ── Trend Fit Score — hero signal ── */}
            <Section title="CPS Market Context" surface="section" gap={400}>
              <Stack gap={300}>
                <MetaText emphasis="tertiary" uppercase>Trend Fit Score</MetaText>
                <Cluster gap={300} align="flex-end">
                  <span style={{
                    fontFamily:         typography.fontFamily.body,
                    fontSize:           '36px',
                    fontWeight:         typography.fontWeight.semibold,
                    lineHeight:         1,
                    fontVariantNumeric: 'tabular-nums',
                    color:              trendFitColour(trendFit),
                  }}>
                    {trendFit}
                  </span>
                  <span style={{ ...typography.scale['body/md/regular'], color: semantic.foreground.default.secondary.light, paddingBottom: spacing[100] }}>
                    / 100
                  </span>
                </Cluster>
                <MetaText emphasis="secondary">
                  {trendFit >= 70 ? 'Strong alignment with CPS market trends'
                    : trendFit >= 50 ? 'Partial alignment — consider swapping low-frequency ingredients'
                    : 'Low alignment — ingredients diverge from current CPS trends'}
                </MetaText>
              </Stack>
            </Section>

            {/* ── Cost vs CPS Benchmark ── */}
            <Section title="Cost vs CPS Benchmark" surface="section" gap={300}>
              <Stack gap={200}>
                <Cluster gap={200} align="flex-end">
                  <span style={{
                    fontFamily:         typography.fontFamily.body,
                    fontSize:           '28px',
                    fontWeight:         typography.fontWeight.semibold,
                    lineHeight:         1.2,
                    fontVariantNumeric: 'tabular-nums',
                    color:              belowBench
                      ? semantic.foreground.positive.default.light
                      : semantic.foreground.negative.default.light,
                  }}>
                    £{totalCost.toFixed(2)}
                  </span>
                  <Cluster gap={100} align="center" style={{ paddingBottom: spacing[100] }}>
                    <span style={{ display: 'flex', color: belowBench ? semantic.foreground.positive.default.light : semantic.foreground.negative.default.light }}>
                      {belowBench ? <ArrowDownwardOutline size={16} /> : <ArrowUpwardOutline size={16} />}
                    </span>
                    <MetaText emphasis={belowBench ? 'positive' : 'negative'}>
                      {belowBench ? '-' : '+'}£{Math.abs(cpsDelta).toFixed(2)} vs CPS benchmark
                    </MetaText>
                  </Cluster>
                </Cluster>
                <MetaText emphasis="tertiary">CPS benchmark: £{CPS_BENCHMARK.toFixed(2)} per portion</MetaText>
              </Stack>
            </Section>

            {/* ── Supply risk ── */}
            <Section title="Supply Risk" surface="section" gap={200}>
              <Stack gap={100}>
                {ingredients.filter(i => i.name).map(ing => (
                  <Cluster key={ing.id} gap={200} align="center" justify="space-between"
                    style={{ paddingTop: spacing[100], paddingBottom: spacing[100] }}>
                    <BodyText density="compact" as="span">{ing.name}</BodyText>
                    <StatusIndicator
                      status={supplyStatus(ing.supplyRisk)}
                      label={ing.supplyRisk === 'low' ? 'Low risk' : ing.supplyRisk === 'medium' ? 'Medium risk' : 'High risk'}
                    />
                  </Cluster>
                ))}
              </Stack>
            </Section>

            <Divider />

            {/* ── CPS guardrails ── */}
            <Section title="CPS Guardrails" surface="section" gap={100}>
              <Stack gap={0}>
                {CPS_GUARDRAILS.map((g, i) => <GuardrailRow key={i} item={g} />)}
              </Stack>
            </Section>

          </Stack>

        </SplitPane>
      </PageContent>
    </PageShell>
  )
}

export default function RecipeBuilderCpsPage() {
  return (
    <Suspense fallback={null}>
      <RecipeBuilderCpsInner />
    </Suspense>
  )
}
