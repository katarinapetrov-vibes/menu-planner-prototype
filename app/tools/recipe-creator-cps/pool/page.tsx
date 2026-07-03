'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PageShell,
  PageContent,
  PageHeader,
  Stack,
  Cluster,
  BodyText,
  MetaText,
} from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import type { SideNavGroup, SideNavUser } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { Dialog } from '@/components/ui/dialog'
import { RadioGroup, RadioButton } from '@/components/ui/radio-button'
import { InputField } from '@/components/ui/input-field'
import { DropzoneAndUpload } from '@/components/ui/dropzone-and-upload'
import {
  InsertChartOutline,
  TableChartOutline,
  AddOutline,
  ArrowUpwardOutline,
  ArrowDownwardOutline,
  StarFilled,
} from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { semantic, typography } from '@/lib/tokens'

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

type RecipeStatus = 'Draft' | 'In Testing' | 'Live'
type SupplyRisk   = 'low' | 'medium' | 'high'

interface CpsRecipe {
  id:           string
  name:         string
  protein:      string
  dietary:      string
  cpsScore:     number       // 0–100
  costDelta:    number       // £ vs CPS benchmark — negative = below (good)
  supplyRisk:   SupplyRisk
  rating:       number
  status:       RecipeStatus
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RECIPES: CpsRecipe[] = [
  { id: 'RC-001', name: 'Smoky Black Bean Tacos',         protein: 'Plant',   dietary: 'Vegan',       cpsScore: 82, costDelta: -0.42, supplyRisk: 'low',    rating: 4.1, status: 'Draft'      },
  { id: 'RC-002', name: 'Lemon Herb Roast Chicken',       protein: 'Chicken', dietary: 'Gluten-Free', cpsScore: 91, costDelta: +0.18, supplyRisk: 'low',    rating: 4.7, status: 'Live'       },
  { id: 'RC-003', name: 'Mushroom & Spinach Risotto',     protein: 'Plant',   dietary: 'Vegetarian',  cpsScore: 55, costDelta: -0.30, supplyRisk: 'medium', rating: 4.3, status: 'In Testing' },
  { id: 'RC-004', name: 'Teriyaki Salmon Bowl',           protein: 'Fish',    dietary: 'Dairy-Free',  cpsScore: 78, costDelta: +0.55, supplyRisk: 'medium', rating: 4.6, status: 'Live'       },
  { id: 'RC-005', name: 'Beef & Broccoli Stir Fry',       protein: 'Beef',    dietary: 'Dairy-Free',  cpsScore: 63, costDelta: -0.12, supplyRisk: 'low',    rating: 4.4, status: 'Live'       },
  { id: 'RC-006', name: 'Chickpea Tikka Masala',          protein: 'Plant',   dietary: 'Vegan',       cpsScore: 34, costDelta: -0.58, supplyRisk: 'low',    rating: 4.0, status: 'Draft'      },
  { id: 'RC-007', name: 'Pork Meatball Spaghetti',        protein: 'Pork',    dietary: 'Standard',    cpsScore: 71, costDelta: +0.08, supplyRisk: 'low',    rating: 4.5, status: 'Live'       },
  { id: 'RC-008', name: 'Thai Green Vegetable Curry',     protein: 'Plant',   dietary: 'Vegan',       cpsScore: 47, costDelta: -0.22, supplyRisk: 'low',    rating: 3.9, status: 'Draft'      },
  { id: 'RC-009', name: 'Lamb Kofta with Flatbread',      protein: 'Lamb',    dietary: 'Standard',    cpsScore: 88, costDelta: +0.31, supplyRisk: 'low',    rating: 4.8, status: 'In Testing' },
  { id: 'RC-010', name: 'Prawn Pad Thai',                 protein: 'Seafood', dietary: 'Dairy-Free',  cpsScore: 76, costDelta: +0.14, supplyRisk: 'medium', rating: 4.6, status: 'Live'       },
  { id: 'RC-011', name: 'Cauliflower Shawarma Wrap',      protein: 'Plant',   dietary: 'Vegan',       cpsScore: 29, costDelta: -0.44, supplyRisk: 'high',   rating: 3.8, status: 'Draft'      },
  { id: 'RC-012', name: 'Honey Garlic Pork Tenderloin',   protein: 'Pork',    dietary: 'Gluten-Free', cpsScore: 68, costDelta: -0.09, supplyRisk: 'low',    rating: 4.4, status: 'Live'       },
  { id: 'RC-013', name: 'Tofu Katsu Curry',               protein: 'Plant',   dietary: 'Vegan',       cpsScore: 59, costDelta: -0.33, supplyRisk: 'medium', rating: 4.2, status: 'In Testing' },
  { id: 'RC-014', name: 'Grilled Sea Bass with Salsa',    protein: 'Fish',    dietary: 'Gluten-Free', cpsScore: 84, costDelta: +0.62, supplyRisk: 'low',    rating: 4.7, status: 'Live'       },
  { id: 'RC-015', name: 'Smoky Pulled Jackfruit Burrito', protein: 'Plant',   dietary: 'Vegan',       cpsScore: 41, costDelta: -0.51, supplyRisk: 'medium', rating: 4.0, status: 'Draft'      },
  { id: 'RC-016', name: 'Chicken Caesar Salad',           protein: 'Chicken', dietary: 'Standard',    cpsScore: 73, costDelta: +0.05, supplyRisk: 'low',    rating: 4.3, status: 'Live'       },
  { id: 'RC-017', name: 'Butternut Squash Soup',          protein: 'Plant',   dietary: 'Vegan',       cpsScore: 38, costDelta: -0.61, supplyRisk: 'low',    rating: 3.7, status: 'Draft'      },
  { id: 'RC-018', name: 'Duck Breast with Cherry Sauce',  protein: 'Poultry', dietary: 'Gluten-Free', cpsScore: 93, costDelta: +0.44, supplyRisk: 'low',    rating: 4.9, status: 'Live'       },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cpsScoreColour(score: number): string {
  if (score >= 70) return semantic.foreground.positive.default.light
  if (score >= 40) return semantic.foreground.warning.default.light
  return semantic.foreground.negative.default.light
}

function costDeltaColour(delta: number): string {
  return delta <= 0
    ? semantic.foreground.positive.default.light
    : semantic.foreground.negative.default.light
}

function supplyRiskStatus(risk: SupplyRisk): 'success' | 'warning' | 'error' {
  return risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error'
}

type AIMethod = 'prompt' | 'photo' | 'url'

// ─── Table columns ────────────────────────────────────────────────────────────

const columns = [
  {
    key:     'cpsScore',
    label:   'CPS Score',
    sortable: true,
    width:   110,
    align:   'center' as const,
    render:  (value: unknown) => (
      <span style={{
        ...typography.scale['body/lg/semi'],
        fontVariantNumeric: 'tabular-nums',
        color: cpsScoreColour(value as number),
      }}>
        {value as number}
      </span>
    ),
  },
  {
    key:      'name',
    label:    'Recipe',
    sortable: true,
    minWidth: 200,
    render:   (value: unknown, row: Record<string, unknown>) => (
      <Stack gap={50}>
        <BodyText density="compact" weight="semi" as="span">{String(value)}</BodyText>
        <MetaText emphasis="tertiary">{String(row.id)}</MetaText>
      </Stack>
    ),
  },
  {
    key:      'protein',
    label:    'Protein',
    sortable: true,
    width:    100,
    render:   (value: unknown) => (
      <BodyText density="compact" as="span">{String(value)}</BodyText>
    ),
  },
  {
    key:      'dietary',
    label:    'Dietary',
    sortable: true,
    width:    120,
    render:   (value: unknown) => (
      <BodyText density="compact" as="span">{String(value)}</BodyText>
    ),
  },
  {
    key:     'costDelta',
    label:   'vs CPS Cost',
    sortable: true,
    width:   130,
    align:   'right' as const,
    render:  (value: unknown) => {
      const delta = value as number
      const below = delta <= 0
      return (
        <Cluster gap={100} justify="flex-end" align="center">
          <span style={{ display: 'flex', color: costDeltaColour(delta) }}>
            {below ? <ArrowDownwardOutline size={16} /> : <ArrowUpwardOutline size={16} />}
          </span>
          <span style={{
            ...typography.scale['body/sm/regular'],
            fontVariantNumeric: 'tabular-nums',
            color: costDeltaColour(delta),
          }}>
            {below ? '-' : '+'}£{Math.abs(delta).toFixed(2)}
          </span>
        </Cluster>
      )
    },
  },
  {
    key:    'supplyRisk',
    label:  'Supply',
    width:  120,
    render: (value: unknown) => (
      <StatusIndicator
        status={supplyRiskStatus(value as SupplyRisk)}
        label={`${String(value).charAt(0).toUpperCase() + String(value).slice(1)} risk`}
      />
    ),
  },
  {
    key:     'rating',
    label:   'Rating',
    sortable: true,
    width:   90,
    align:   'right' as const,
    render:  (value: unknown) => (
      <Cluster gap={100} justify="flex-end" align="center">
        <span style={{ color: semantic.foreground.warning.default.light, display: 'flex' }}>
          <StarFilled size={16} />
        </span>
        <span style={{
          ...typography.scale['body/sm/regular'],
          fontVariantNumeric: 'tabular-nums',
          color: semantic.foreground.default.primary.light,
        }}>
          {Number(value).toFixed(1)}
        </span>
      </Cluster>
    ),
  },
  {
    key:    'status',
    label:  'Status',
    width:  120,
    render: (value: unknown) => {
      const v = value as RecipeStatus
      const map: Record<RecipeStatus, 'success' | 'warning' | 'info'> = {
        Live: 'success', 'In Testing': 'warning', Draft: 'info',
      }
      return <StatusIndicator status={map[v]} label={v} />
    },
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CpsRecipePoolPage() {
  const router = useRouter()

  const [activeNav,      setActiveNav]      = useState('pool')
  const [page,           setPage]           = useState(1)
  const [rowsPerPage,    setRowsPerPage]     = useState(10)
  const [dialogOpen,     setDialogOpen]     = useState(false)
  const [step,           setStep]           = useState<1 | 2>(1)
  const [creationMethod, setCreationMethod] = useState<'scratch' | 'brief' | 'ai'>('scratch')
  const [aiMethod,       setAiMethod]       = useState<AIMethod>('prompt')
  const [aiPrompt,       setAiPrompt]       = useState('')
  const [aiUrl,          setAiUrl]          = useState('')

  const totalPages = Math.ceil(MOCK_RECIPES.length / rowsPerPage)
  const pageData   = MOCK_RECIPES.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const openDialog = () => {
    setStep(1); setCreationMethod('scratch')
    setAiMethod('prompt'); setAiPrompt(''); setAiUrl('')
    setDialogOpen(true)
  }

  const handleDialogPrimary = () => {
    if (step === 1 && creationMethod === 'ai') { setStep(2); return }
    const params = new URLSearchParams({ method: creationMethod })
    if (creationMethod === 'ai') {
      params.set('aiMethod', aiMethod)
      if (aiMethod === 'prompt' && aiPrompt) params.set('prompt', aiPrompt)
      if (aiMethod === 'url'    && aiUrl)    params.set('url',    aiUrl)
    }
    setDialogOpen(false)
    router.push(`/tools/recipe-creator-cps/builder?${params.toString()}`)
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
          title="Recipe Pool"
          subtitle="CPS performance scores and cost benchmarks alongside your recipe catalogue"
          primary={
            <Button variant="fill" color="positive" size="md"
              showLeadingIcon leadingIcon={<AddOutline />}
              onClick={openDialog}>
              New Recipe
            </Button>
          }
          ghost={
            <Button variant="text" color="neutral" size="md"
              onClick={() => router.push('/tools/recipe-creator-cps')}>
              Menu Intelligence
            </Button>
          }
        />

        <Stack gap={400}>
          <Table
            title="All recipes"
            showCount
            columns={columns}
            data={pageData as unknown as Record<string, unknown>[]}
            rowKey="id"
            searchable
            searchPlaceholder="Search recipes…"
            filterButton
            size="compact"
          />
          <Cluster justify="flex-end">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={MOCK_RECIPES.length}
              pageSize={rowsPerPage}
              pageSizeOptions={[10, 25, 50]}
              onPageChange={setPage}
              onPageSizeChange={size => { setRowsPerPage(size); setPage(1) }}
              showRowsPerPage
              showRangeText
            />
          </Cluster>
        </Stack>
      </PageContent>

      {/* ── New Recipe Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        size="md"
        showTitle
        title={step === 1 ? 'How would you like to create this recipe?' : 'Give the AI something to start with'}
        showDescription={false}
        showSwapperGroup
        swapperContent={
          step === 1 ? (
            <RadioGroup value={creationMethod} onChange={v => setCreationMethod(v as 'scratch' | 'brief' | 'ai')} size="md">
              <RadioButton value="scratch" label="From scratch"     description="Start with a blank form and build the recipe yourself" />
              <RadioButton value="brief"   label="From a brief"     description="Use a predefined brief template to guide the structure" />
              <RadioButton value="ai"      label="Generate with AI" description="Let AI draft a recipe from a prompt, photo, or URL" />
            </RadioGroup>
          ) : (
            <Stack gap={400}>
              <RadioGroup value={aiMethod} onChange={v => setAiMethod(v as AIMethod)} size="md">
                <RadioButton value="prompt" label="Describe the recipe" />
                <RadioButton value="photo"  label="Upload a photo"      />
                <RadioButton value="url"    label="Paste a URL"         />
              </RadioGroup>
              {aiMethod === 'prompt' && (
                <InputField
                  label="What should the recipe be?"
                  placeholder="e.g. A high-protein vegan lunch under £3.50"
                  value={aiPrompt}
                  onChange={v => setAiPrompt(v)}
                  layout="stacked"
                />
              )}
              {aiMethod === 'photo' && (
                <DropzoneAndUpload accept="image/*" acceptLabel="JPG, PNG, WEBP" />
              )}
              {aiMethod === 'url' && (
                <InputField
                  label="Recipe URL"
                  placeholder="https://..."
                  value={aiUrl}
                  onChange={v => setAiUrl(v)}
                  layout="stacked"
                />
              )}
            </Stack>
          )
        }
        showButtons
        showRightButtons
        rightFilledButton={{
          label:   step === 1 && creationMethod === 'ai' ? 'Next' : 'Start building',
          onClick: handleDialogPrimary,
        }}
        rightOutlineButton={step === 2 ? { label: 'Back', onClick: () => setStep(1) } : undefined}
        showLeftButtons={false}
      />
    </PageShell>
  )
}
