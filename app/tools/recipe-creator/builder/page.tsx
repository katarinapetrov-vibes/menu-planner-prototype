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
  BookForkKnifeOutline,
  AddOutline,
  DeleteOutline,
  CheckCircleOutline,
  ErrorOutline,
  ArrowDownwardOutline,
  ArrowUpwardOutline,
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

interface Ingredient {
  id:           string
  name:         string
  qty:          string
  unit:         string
  costPer:      number   // cost per unit in £
  availability: number   // 0–100 %
  supplyRisk:   'low' | 'medium' | 'high'
}

interface Guardrail {
  label:  string
  status: 'pass' | 'fail' | 'pending'
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'i1', name: 'Firm Tofu',        qty: '200', unit: 'g',   costPer: 0.008, availability: 92, supplyRisk: 'low'    },
  { id: 'i2', name: 'Soy Sauce',        qty: '30',  unit: 'ml',  costPer: 0.012, availability: 88, supplyRisk: 'low'    },
  { id: 'i3', name: 'Sesame Oil',       qty: '15',  unit: 'ml',  costPer: 0.035, availability: 74, supplyRisk: 'medium' },
  { id: 'i4', name: 'Brown Rice',       qty: '150', unit: 'g',   costPer: 0.004, availability: 95, supplyRisk: 'low'    },
  { id: 'i5', name: 'Spring Onion',     qty: '40',  unit: 'g',   costPer: 0.018, availability: 61, supplyRisk: 'medium' },
  { id: 'i6', name: 'Black Sesame Seed', qty: '5',  unit: 'g',   costPer: 0.060, availability: 43, supplyRisk: 'high'   },
]

const GUARDRAILS: Guardrail[] = [
  { label: 'Cost within target (≤ £4.00)',         status: 'pass'    },
  { label: 'Protein target met (≥ 25g)',            status: 'pass'    },
  { label: 'Allergens declared (soy, sesame)',       status: 'pending' },
  { label: 'Calorie range (400–700 kcal)',           status: 'pass'    },
  { label: 'Vegan dietary compliance',              status: 'pass'    },
  { label: 'Carbon footprint band (A–C)',           status: 'pending' },
]

const COST_TARGET = 4.00

const PROTEIN_OPTIONS = [
  { label: 'Plant',   value: 'plant'   },
  { label: 'Chicken', value: 'chicken' },
  { label: 'Beef',    value: 'beef'    },
  { label: 'Pork',    value: 'pork'    },
  { label: 'Fish',    value: 'fish'    },
  { label: 'Seafood', value: 'seafood' },
  { label: 'Lamb',    value: 'lamb'    },
  { label: 'Poultry', value: 'poultry' },
]

const DIETARY_OPTIONS = [
  { label: 'Vegan',       value: 'vegan'       },
  { label: 'Vegetarian',  value: 'vegetarian'  },
  { label: 'Gluten-Free', value: 'gluten-free' },
  { label: 'Dairy-Free',  value: 'dairy-free'  },
  { label: 'Standard',    value: 'standard'    },
]

const UNIT_OPTIONS = [
  { label: 'g',   value: 'g'   },
  { label: 'ml',  value: 'ml'  },
  { label: 'tsp', value: 'tsp' },
  { label: 'tbsp',value: 'tbsp'},
  { label: 'pcs', value: 'pcs' },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcIngredientCost(ing: Ingredient): number {
  return parseFloat(ing.qty || '0') * ing.costPer
}

function calcTotalCost(ingredients: Ingredient[]): number {
  return ingredients.reduce((sum, ing) => sum + calcIngredientCost(ing), 0)
}

function availabilityColour(pct: number, theme: 'light' = 'light'): string {
  if (pct >= 80) return semantic.foreground.positive.default[theme]
  if (pct >= 50) return semantic.foreground.warning.default[theme]
  return semantic.foreground.negative.default[theme]
}

function supplyRiskStatus(risk: Ingredient['supplyRisk']): 'success' | 'warning' | 'error' {
  if (risk === 'low')    return 'success'
  if (risk === 'medium') return 'warning'
  return 'error'
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function GuardrailRow({ item }: { item: Guardrail }) {
  const iconStyle: React.CSSProperties = { display: 'flex', flexShrink: 0 }
  const icon =
    item.status === 'pass'    ? <span style={{ ...iconStyle, color: semantic.foreground.positive.default.light }}><CheckCircleOutline size={16} /></span>
  : item.status === 'fail'    ? <span style={{ ...iconStyle, color: semantic.foreground.negative.default.light }}><ErrorOutline size={16} /></span>
  : <span style={{ ...iconStyle, color: semantic.foreground.warning.default.light }}><ErrorOutline size={16} /></span>

  return (
    <Cluster gap={200} align="center" style={{ paddingTop: spacing[100], paddingBottom: spacing[100] }}>
      {icon}
      <MetaText emphasis={item.status === 'fail' ? 'negative' : item.status === 'pass' ? 'positive' : 'secondary'}>
        {item.label}
      </MetaText>
    </Cluster>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Pre-populated seed data per method ──────────────────────────────────────
// "brief" seeds a partially filled form to simulate a brief template.
// "ai"    seeds a fully formed suggestion to simulate AI generation.
// "scratch" starts blank.

const SEED_BY_METHOD: Record<string, {
  name:        string
  description: string
  protein:     string
  dietary:     string
  allergens:   string[]
  ingredients: Ingredient[]
}> = {
  scratch: {
    name: '', description: '', protein: '', dietary: '', allergens: [], ingredients: [],
  },
  brief: {
    name:        'High-Protein Plant Bowl',
    description: '',
    protein:     'plant',
    dietary:     'vegan',
    allergens:   [],
    ingredients: [
      { id: 'b1', name: 'Chickpeas',   qty: '120', unit: 'g',  costPer: 0.005, availability: 95, supplyRisk: 'low' },
      { id: 'b2', name: 'Quinoa',      qty: '80',  unit: 'g',  costPer: 0.012, availability: 88, supplyRisk: 'low' },
      { id: 'b3', name: 'Kale',        qty: '60',  unit: 'g',  costPer: 0.009, availability: 82, supplyRisk: 'low' },
    ],
  },
  ai: {
    name:        'Sesame Tofu Rice Bowl',
    description: 'A light, high-protein plant-based bowl with nutty sesame notes and fluffy brown rice.',
    protein:     'plant',
    dietary:     'vegan',
    allergens:   ['soy', 'sesame'],
    ingredients: INITIAL_INGREDIENTS,
  },
}

function RecipeBuilderInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const method       = searchParams.get('method') ?? 'scratch'
  const aiPrompt     = searchParams.get('prompt') ?? ''

  const seed = useMemo(() => SEED_BY_METHOD[method] ?? SEED_BY_METHOD.scratch, [method])

  const [activeNav, setActiveNav] = useState('pool')

  // ── Form state — seeded from creation method ─────────────────────────────────
  const [recipeName,    setRecipeName]    = useState(seed.name)
  const [description,   setDescription]  = useState(
    method === 'ai' && aiPrompt ? `AI-generated from: "${aiPrompt}"` : seed.description
  )
  const [method2,       setMethod2]       = useState('')
  const [mainProtein,   setMainProtein]   = useState(seed.protein)
  const [dietaryType,   setDietaryType]   = useState(seed.dietary)
  const [allergens,     setAllergens]     = useState<string[]>(seed.allergens)
  const [ingredients,   setIngredients]   = useState<Ingredient[]>(seed.ingredients)

  // ── Ingredient row actions ───────────────────────────────────────────────────
  const removeIngredient = (id: string) =>
    setIngredients(prev => prev.filter(i => i.id !== id))

  const addIngredientRow = () =>
    setIngredients(prev => [
      ...prev,
      { id: `i${Date.now()}`, name: '', qty: '', unit: 'g', costPer: 0, availability: 100, supplyRisk: 'low' },
    ])

  // ── Derived values ───────────────────────────────────────────────────────────
  const totalCost   = calcTotalCost(ingredients)
  const costDelta   = totalCost - COST_TARGET
  const overBudget  = costDelta > 0

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
            value:    countryOptions[0].value,
            options:  countryOptions,
            onChange: () => {},
          }}
        />
      }
    >
      <PageContent>
        {/* ── Page header with action zone ─────────────────────────────── */}
        <PageHeader
          title="Recipe Builder"
          subtitle="Build your recipe and validate it against supply and market guardrails"
          primary={
            <Button variant="fill" color="positive" size="md"
              onClick={() => router.push('/tools/recipe-creator')}>
              Save to Pool
            </Button>
          }
          secondary={
            <Button variant="outline" color="neutral" size="md"
              onClick={() => router.push('/tools/recipe-creator/variants')}>
              Create Variants
            </Button>
          }
          ghost={
            <Button variant="text" color="neutral" size="md">
              Save Draft
            </Button>
          }
        />

        {/* ── Source banner — shows how this recipe was started ─────────── */}
        {method !== 'scratch' && (
          <Cluster gap={200} align="center" style={{
            padding: `${spacing[200]} ${spacing[400]}`,
            background: semantic.background.information.defaultSubtle.light,
            borderRadius: '8px',
          }}>
            <MetaText emphasis="secondary">
              {method === 'ai'    ? `Started with AI generation${aiPrompt ? ` — "${aiPrompt}"` : ''}` : ''}
              {method === 'brief' ? 'Started from a brief template — fill in the remaining fields' : ''}
            </MetaText>
          </Cluster>
        )}

        {/* ── Two-pane layout: form (left 2/3) + validation (right 1/3) ── */}
        <SplitPane ratio="2:1" gap={600}>

          {/* ════════════ LEFT — Recipe Form ════════════ */}
          <Stack gap={600}>

            {/* Recipe details */}
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
                    onChange={(v) => setMainProtein(v as string)}
                    layout="stacked"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <DropdownField
                    label="Dietary type"
                    options={DIETARY_OPTIONS}
                    value={dietaryType}
                    onChange={(v) => setDietaryType(v as string)}
                    layout="stacked"
                  />
                </div>
              </Cluster>
              <DropdownField
                label="Allergens"
                options={ALLERGEN_OPTIONS}
                value={allergens}
                onChange={(v) => setAllergens(v as string[])}
                multi
                placeholder="Select all that apply"
                layout="stacked"
              />
            </Section>

            {/* Ingredients */}
            <Section title="Ingredients" surface="section" gap={400}>
              <DataTable density="compact">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Ingredient</th>
                    <th style={{ width: '12%', textAlign: 'right' }}>Qty</th>
                    <th style={{ width: '10%' }}>Unit</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>Cost</th>
                    <th style={{ width: '16%', textAlign: 'right' }}>Avail.</th>
                    <th style={{ width: '40px' }} />
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing) => {
                    const lineCost = calcIngredientCost(ing)
                    return (
                      <tr key={ing.id}>
                        <td>
                          <BodyText density="compact" weight="semi" as="span">
                            {ing.name || <MetaText emphasis="tertiary">Enter ingredient…</MetaText>}
                          </BodyText>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{
                            ...typography.scale['body/sm/regular'],
                            fontVariantNumeric: 'tabular-nums',
                            color: semantic.foreground.default.primary.light,
                          }}>
                            {ing.qty}
                          </span>
                        </td>
                        <td>
                          <MetaText emphasis="secondary">{ing.unit}</MetaText>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{
                            ...typography.scale['body/sm/regular'],
                            fontVariantNumeric: 'tabular-nums',
                            color: semantic.foreground.default.primary.light,
                          }}>
                            £{lineCost.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{
                            ...typography.scale['body/sm/regular'],
                            fontVariantNumeric: 'tabular-nums',
                            color: availabilityColour(ing.availability),
                          }}>
                            {ing.availability}%
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            aria-label={`Remove ${ing.name}`}
                            onClick={() => removeIngredient(ing.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: spacing[100],
                              color: semantic.foreground.default.tertiary.light,
                            }}
                          >
                            <DeleteOutline size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </DataTable>

              <Button
                variant="outline"
                color="neutral"
                size="sm"
                showLeadingIcon
                leadingIcon={<AddOutline />}
                onClick={addIngredientRow}
              >
                Add ingredient
              </Button>
            </Section>

            {/* Method & Instructions */}
            <Section title="Method & Instructions" surface="section" gap={400}>
              <TextArea
                label="Cooking method"
                value={method2}
                onChange={setMethod2}
                rows={6}
                placeholder="Step-by-step preparation and cooking instructions…"
              />
            </Section>

          </Stack>

          {/* ════════════ RIGHT — Validation Panel ════════════ */}
          <Stack gap={500}>

            {/* Cost vs Target — hero signal */}
            <Section title="Cost vs Target" surface="section" gap={300}>
              <Stack gap={200}>
                {/* Hero delta number */}
                <Cluster gap={200} align="flex-end">
                  <span style={{
                    fontFamily:         typography.fontFamily.body,
                    fontSize:           '28px',
                    fontWeight:         typography.fontWeight.semibold,
                    lineHeight:         1.2,
                    fontVariantNumeric: 'tabular-nums',
                    color:              overBudget
                      ? semantic.foreground.negative.default.light
                      : semantic.foreground.positive.default.light,
                  }}>
                    £{totalCost.toFixed(2)}
                  </span>
                  <Cluster gap={100} align="center" style={{ paddingBottom: spacing[100] }}>
                    <span style={{ display: 'flex', color: overBudget
                      ? semantic.foreground.negative.default.light
                      : semantic.foreground.positive.default.light }}>
                      {overBudget ? <ArrowUpwardOutline size={16} /> : <ArrowDownwardOutline size={16} />}
                    </span>
                    <MetaText emphasis={overBudget ? 'negative' : 'positive'}>
                      {overBudget ? '+' : '-'}£{Math.abs(costDelta).toFixed(2)} vs target
                    </MetaText>
                  </Cluster>
                </Cluster>
                <MetaText emphasis="tertiary">
                  Target: £{COST_TARGET.toFixed(2)} per portion
                </MetaText>
              </Stack>
            </Section>

            {/* Supply risk per ingredient */}
            <Section title="Supply Risk" surface="section" gap={200}>
              <Stack gap={100}>
                {ingredients.filter(i => i.name).map((ing) => (
                  <Cluster key={ing.id} gap={200} align="center" justify="space-between"
                    style={{ paddingTop: spacing[100], paddingBottom: spacing[100] }}>
                    <BodyText density="compact" as="span">{ing.name}</BodyText>
                    <StatusIndicator
                      status={supplyRiskStatus(ing.supplyRisk)}
                      label={ing.supplyRisk === 'low' ? 'Low risk' : ing.supplyRisk === 'medium' ? 'Medium risk' : 'High risk'}
                    />
                  </Cluster>
                ))}
              </Stack>
            </Section>

            <Divider />

            {/* Market guardrails */}
            <Section title="Market Guardrails" surface="section" gap={100}>
              <Stack gap={0}>
                {GUARDRAILS.map((g, i) => (
                  <GuardrailRow key={i} item={g} />
                ))}
              </Stack>
            </Section>

          </Stack>

        </SplitPane>
      </PageContent>
    </PageShell>
  )
}

export default function RecipeBuilderPage() {
  return (
    <Suspense fallback={null}>
      <RecipeBuilderInner />
    </Suspense>
  )
}
