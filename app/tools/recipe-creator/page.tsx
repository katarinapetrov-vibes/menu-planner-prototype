'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageShell, PageContent, PageHeader, Stack, Cluster, BodyText, MetaText } from '@/lib/layout'
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
  BookForkKnifeOutline,
  AddOutline,
  StarFilled,
} from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { spacing, typography, semantic } from '@/lib/tokens'

// ─── Nav config ───────────────────────────────────────────────────────────────

const navGroups: SideNavGroup[] = [
  {
    id: 'main',
    items: [
      {
        id: 'pool',
        label: 'Recipe Creator',
        icon: <BookForkKnifeOutline />,
        href: '/tools/recipe-creator',
      },
    ],
  },
]

const navUser: SideNavUser = {
  name: 'Alex Müller',
  role: 'Recipe Developer',
  email: 'alex.muller@hellofresh.com',
}

// ─── Mock data ────────────────────────────────────────────────────────────────

type RecipeRow = {
  id: string
  name: string
  protein: string
  dietary: string
  cost: string
  rating: number
  menuGap: boolean
  status: 'Draft' | 'In Testing' | 'Live'
}

const MOCK_RECIPES: RecipeRow[] = [
  { id: 'RC-001', name: 'Smoky Black Bean Tacos',         protein: 'Plant',   dietary: 'Vegan',       cost: '£3.20', rating: 4.1, menuGap: true,  status: 'Draft'      },
  { id: 'RC-002', name: 'Lemon Herb Roast Chicken',       protein: 'Chicken', dietary: 'Gluten-Free', cost: '£4.85', rating: 4.7, menuGap: false, status: 'Live'       },
  { id: 'RC-003', name: 'Mushroom & Spinach Risotto',     protein: 'Plant',   dietary: 'Vegetarian',  cost: '£3.60', rating: 4.3, menuGap: true,  status: 'In Testing' },
  { id: 'RC-004', name: 'Teriyaki Salmon Bowl',           protein: 'Fish',    dietary: 'Dairy-Free',  cost: '£5.40', rating: 4.6, menuGap: false, status: 'Live'       },
  { id: 'RC-005', name: 'Beef & Broccoli Stir Fry',       protein: 'Beef',    dietary: 'Dairy-Free',  cost: '£4.20', rating: 4.4, menuGap: false, status: 'Live'       },
  { id: 'RC-006', name: 'Chickpea Tikka Masala',          protein: 'Plant',   dietary: 'Vegan',       cost: '£2.90', rating: 4.0, menuGap: true,  status: 'Draft'      },
  { id: 'RC-007', name: 'Pork Meatball Spaghetti',        protein: 'Pork',    dietary: 'Standard',    cost: '£3.75', rating: 4.5, menuGap: false, status: 'Live'       },
  { id: 'RC-008', name: 'Thai Green Vegetable Curry',     protein: 'Plant',   dietary: 'Vegan',       cost: '£3.10', rating: 3.9, menuGap: true,  status: 'Draft'      },
  { id: 'RC-009', name: 'Lamb Kofta with Flatbread',      protein: 'Lamb',    dietary: 'Standard',    cost: '£5.10', rating: 4.8, menuGap: false, status: 'In Testing' },
  { id: 'RC-010', name: 'Prawn Pad Thai',                 protein: 'Seafood', dietary: 'Dairy-Free',  cost: '£4.65', rating: 4.6, menuGap: false, status: 'Live'       },
  { id: 'RC-011', name: 'Cauliflower Shawarma Wrap',      protein: 'Plant',   dietary: 'Vegan',       cost: '£2.80', rating: 3.8, menuGap: true,  status: 'Draft'      },
  { id: 'RC-012', name: 'Honey Garlic Pork Tenderloin',   protein: 'Pork',    dietary: 'Gluten-Free', cost: '£4.30', rating: 4.4, menuGap: false, status: 'Live'       },
  { id: 'RC-013', name: 'Tofu Katsu Curry',               protein: 'Plant',   dietary: 'Vegan',       cost: '£3.40', rating: 4.2, menuGap: true,  status: 'In Testing' },
  { id: 'RC-014', name: 'Grilled Sea Bass with Salsa',    protein: 'Fish',    dietary: 'Gluten-Free', cost: '£5.60', rating: 4.7, menuGap: false, status: 'Live'       },
  { id: 'RC-015', name: 'Smoky Pulled Jackfruit Burrito', protein: 'Plant',   dietary: 'Vegan',       cost: '£3.00', rating: 4.0, menuGap: true,  status: 'Draft'      },
  { id: 'RC-016', name: 'Chicken Caesar Salad',           protein: 'Chicken', dietary: 'Standard',    cost: '£4.10', rating: 4.3, menuGap: false, status: 'Live'       },
  { id: 'RC-017', name: 'Butternut Squash Soup',          protein: 'Plant',   dietary: 'Vegan',       cost: '£2.50', rating: 3.7, menuGap: true,  status: 'Draft'      },
  { id: 'RC-018', name: 'Duck Breast with Cherry Sauce',  protein: 'Poultry', dietary: 'Gluten-Free', cost: '£6.20', rating: 4.9, menuGap: false, status: 'Live'       },
]

// ─── Table columns ────────────────────────────────────────────────────────────

const columns = [
  {
    key: 'menuGap',
    label: 'Gap',
    width: 72,
    align: 'center' as const,
    render: (value: unknown) => {
      const hasGap = value as boolean
      return (
        <StatusIndicator
          status={hasGap ? 'warning' : 'success'}
          label={hasGap ? 'Gap' : 'Covered'}
        />
      )
    },
  },
  {
    key: 'name',
    label: 'Recipe',
    sortable: true,
    minWidth: 200,
    render: (value: unknown, row: Record<string, unknown>) => (
      <Stack gap={50}>
        <BodyText density="compact" weight="semi" as="span">{String(value)}</BodyText>
        <MetaText emphasis="tertiary">{String(row.id)}</MetaText>
      </Stack>
    ),
  },
  {
    key: 'protein',
    label: 'Protein',
    sortable: true,
    width: 110,
    render: (value: unknown) => (
      <BodyText density="compact" as="span">{String(value)}</BodyText>
    ),
  },
  {
    key: 'dietary',
    label: 'Dietary',
    sortable: true,
    width: 130,
    render: (value: unknown) => (
      <BodyText density="compact" as="span">{String(value)}</BodyText>
    ),
  },
  {
    key: 'cost',
    label: 'Cost / portion',
    sortable: true,
    width: 120,
    align: 'right' as const,
    render: (value: unknown) => (
      <span style={{
        ...typography.scale['body/sm/regular'],
        fontVariantNumeric: 'tabular-nums',
        color: semantic.foreground.default.primary.light,
      }}>
        {String(value)}
      </span>
    ),
  },
  {
    key: 'rating',
    label: 'Rating',
    sortable: true,
    width: 100,
    align: 'right' as const,
    render: (value: unknown) => (
      <Cluster gap={100} justify="flex-end">
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
    key: 'status',
    label: 'Status',
    width: 120,
    render: (value: unknown) => {
      const v = value as RecipeRow['status']
      const statusMap: Record<RecipeRow['status'], 'success' | 'warning' | 'info'> = {
        Live:        'success',
        'In Testing': 'warning',
        Draft:       'info',
      }
      return <StatusIndicator status={statusMap[v]} label={v} />
    },
  },
]

// ─── AI input method sub-options ──────────────────────────────────────────────

type AIMethod = 'prompt' | 'photo' | 'url'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecipePoolPage() {
  const router = useRouter()

  const [activeNav, setActiveNav]           = useState('pool')
  const [page, setPage]                     = useState(1)
  const [rowsPerPage, setRowsPerPage]       = useState(10)

  // Dialog state
  const [dialogOpen, setDialogOpen]         = useState(false)
  const [step, setStep]                     = useState<1 | 2>(1)
  const [creationMethod, setCreationMethod] = useState<'scratch' | 'brief' | 'ai'>('scratch')
  const [aiMethod, setAiMethod]             = useState<AIMethod>('prompt')
  const [aiPrompt, setAiPrompt]             = useState('')
  const [aiUrl, setAiUrl]                   = useState('')

  const totalPages = Math.ceil(MOCK_RECIPES.length / rowsPerPage)
  const pageData   = MOCK_RECIPES.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const openDialog = () => {
    setStep(1)
    setCreationMethod('scratch')
    setAiMethod('prompt')
    setAiPrompt('')
    setAiUrl('')
    setDialogOpen(true)
  }

  const handleDialogPrimary = () => {
    if (step === 1 && creationMethod === 'ai') {
      setStep(2)
      return
    }
    // Navigate to builder, passing method so it can set initial state
    const params = new URLSearchParams({ method: creationMethod })
    if (creationMethod === 'ai') {
      params.set('aiMethod', aiMethod)
      if (aiMethod === 'prompt' && aiPrompt) params.set('prompt', aiPrompt)
      if (aiMethod === 'url'    && aiUrl)    params.set('url',    aiUrl)
    }
    setDialogOpen(false)
    router.push(`/tools/recipe-creator/builder?${params.toString()}`)
  }

  const dialogTitle     = step === 1 ? 'How would you like to create this recipe?' : 'Give the AI something to start with'
  const primaryLabel    = step === 1 && creationMethod === 'ai' ? 'Next' : 'Start building'
  const showBack        = step === 2

  // ── Step 1 — creation method picker ─────────────────────────────────────────
  const step1Content = (
    <RadioGroup
      value={creationMethod}
      onChange={(v) => setCreationMethod(v as 'scratch' | 'brief' | 'ai')}
      size="md"
    >
      <RadioButton
        value="scratch"
        label="From scratch"
        description="Start with a blank form and build the recipe yourself"
      />
      <RadioButton
        value="brief"
        label="From a brief"
        description="Use a predefined brief template to guide the structure"
      />
      <RadioButton
        value="ai"
        label="Generate with AI"
        description="Let AI draft a recipe from a prompt, photo, or URL"
      />
    </RadioGroup>
  )

  // ── Step 2 — AI input method ─────────────────────────────────────────────────
  const step2Content = (
    <Stack gap={400}>
      <RadioGroup
        value={aiMethod}
        onChange={(v) => setAiMethod(v as AIMethod)}
        size="md"
      >
        <RadioButton value="prompt" label="Describe the recipe" />
        <RadioButton value="photo"  label="Upload a photo"      />
        <RadioButton value="url"    label="Paste a URL"         />
      </RadioGroup>

      {aiMethod === 'prompt' && (
        <InputField
          label="What should the recipe be?"
          placeholder="e.g. A high-protein vegan lunch with under £3.50 cost per portion"
          value={aiPrompt}
          onChange={(v) => setAiPrompt(v)}
          layout="stacked"
        />
      )}

      {aiMethod === 'photo' && (
        <DropzoneAndUpload
          accept="image/*"
          acceptLabel="JPG, PNG, WEBP"
        />
      )}

      {aiMethod === 'url' && (
        <InputField
          label="Recipe URL"
          placeholder="https://..."
          value={aiUrl}
          onChange={(v) => setAiUrl(v)}
          layout="stacked"
        />
      )}
    </Stack>
  )

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
        <PageHeader
          title="Recipe Pool"
          subtitle="Browse global recipes, spot menu gaps, and start a new recipe"
          primary={
            <Button
              variant="fill"
              color="positive"
              size="md"
              showLeadingIcon
              leadingIcon={<AddOutline />}
              onClick={openDialog}
            >
              New Recipe
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
              onPageSizeChange={(size) => { setRowsPerPage(size); setPage(1) }}
              showRowsPerPage
              showRangeText
            />
          </Cluster>
        </Stack>
      </PageContent>

      {/* ── New Recipe Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        size="md"
        showTitle
        title={dialogTitle}
        showDescription={false}
        showSwapperGroup
        swapperContent={step === 1 ? step1Content : step2Content}
        showButtons
        showRightButtons
        rightFilledButton={{
          label:   primaryLabel,
          onClick: handleDialogPrimary,
        }}
        rightOutlineButton={
          showBack
            ? { label: 'Back', onClick: () => setStep(1) }
            : undefined
        }
        showLeftButtons={false}
      />
    </PageShell>
  )
}
