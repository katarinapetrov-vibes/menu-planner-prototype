'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PageShell, PageContent, PageHeader, PageToolbar,
  Stack, Cluster, Surface, SectionHeader, FieldReadOnly,
  BodyText, MetaText,
} from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import type { SideNavGroup, SideNavUser } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import type { TableColumn } from '@/components/ui/table'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { DisplayChip } from '@/components/ui/chip'
import { DashboardOutline, ArrowBackOutline, SwapHorizOutline, WarningOutline, ErrorOutline } from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { semantic, spacing } from '@/lib/tokens'

const navGroups: SideNavGroup[] = [{ id: 'main', items: [{ id: 'overview', label: 'Menu Overview', icon: <DashboardOutline />, href: '/tools/recipe-pool-picker' }] }]
const navUser: SideNavUser = { name: 'Anna Fischer', role: 'Menu Planner', email: 'anna.fischer@hellofresh.com' }

type SkuHealth = 'healthy' | 'monitoring' | 'capped' | 'unavailable'

const RECIPE = {
  id: 's3', name: 'Tex-Mex Beef Tacos', slotLabel: 'Slot 3',
  protein: 'Beef', cuisine: 'Mexican', costPerServing: '€4.45',
  constraintSummary: 'All constraints met', dietaryTags: ['Family-friendly', 'Pork-free'], skuIssues: 1,
}

const VARIANTS = [
  { id: 'v1', name: 'Tex-Mex Beef Tacos — Base',         market: 'DE', status: 'active',   skuHealth: 'capped'  as SkuHealth, skuNote: 'Avocado SKU capped' },
  { id: 'v2', name: 'Tex-Mex Beef Tacos — Calorie Smart', market: 'DE', status: 'active',   skuHealth: 'capped'  as SkuHealth, skuNote: 'Avocado SKU capped' },
  { id: 'v3', name: 'Tex-Mex Beef Tacos — Family',        market: 'DE', status: 'active',   skuHealth: 'capped'  as SkuHealth, skuNote: 'Avocado SKU capped' },
  { id: 'v4', name: 'Tex-Mex Beef Tacos — Base',          market: 'AT', status: 'active',   skuHealth: 'healthy' as SkuHealth },
  { id: 'v5', name: 'Tex-Mex Beef Tacos — Base',          market: 'CH', status: 'draft',    skuHealth: 'healthy' as SkuHealth },
]

const INGREDIENTS = [
  { id: 'i1', name: 'Beef mince (20% fat)',    skuCode: 'SKU-BF-2010', availability: 98, capStatus: 'ok',          isFlagged: false },
  { id: 'i2', name: 'Avocado',                 skuCode: 'SKU-AV-0044', availability: 41, capStatus: 'capped',      isFlagged: true,  flagNote: 'Weekly cap reached — 3 active versions affected' },
  { id: 'i3', name: 'Corn tortillas (6-pack)', skuCode: 'SKU-TR-0112', availability: 94, capStatus: 'ok',          isFlagged: false },
  { id: 'i4', name: 'Sour cream',              skuCode: 'SKU-DC-0031', availability: 87, capStatus: 'ok',          isFlagged: false },
  { id: 'i5', name: 'Cheddar cheese (grated)', skuCode: 'SKU-CH-0089', availability: 91, capStatus: 'ok',          isFlagged: false },
  { id: 'i6', name: 'Beef taco seasoning',     skuCode: 'SKU-SP-0204', availability: 76, capStatus: 'monitoring',  isFlagged: false },
  { id: 'i7', name: 'Red onion',               skuCode: 'SKU-VG-0017', availability: 99, capStatus: 'ok',          isFlagged: false },
  { id: 'i8', name: 'Lime',                    skuCode: 'SKU-CT-0003', availability: 95, capStatus: 'ok',          isFlagged: false },
]

function skuHealthToStatus(h: SkuHealth): 'success' | 'warning' | 'error' {
  if (h === 'healthy') return 'success'; if (h === 'monitoring') return 'warning'; return 'error'
}
function skuHealthLabel(h: SkuHealth): string {
  if (h === 'healthy') return 'Healthy'; if (h === 'monitoring') return 'Monitoring'; if (h === 'capped') return 'Capped'; return 'Unavailable'
}
function availabilityColour(pct: number) {
  if (pct >= 80) return semantic.foreground.positive.default.light; if (pct >= 60) return semantic.foreground.warning.default.light; return semantic.foreground.negative.default.light
}

const variantColumns: TableColumn[] = [
  { key: 'name', label: 'Variant', sortable: true },
  { key: 'market', label: 'Market', width: 90, sortable: true },
  { key: 'status', label: 'Status', width: 110, render: (v) => { const s = v as string; return <StatusIndicator status={s === 'active' ? 'success' : s === 'draft' ? 'warning' : 'info'} label={s.charAt(0).toUpperCase() + s.slice(1)} /> } },
  { key: 'skuHealth', label: 'SKU health', width: 180, render: (v, row) => <StatusIndicator status={skuHealthToStatus(v as SkuHealth)} label={skuHealthLabel(v as SkuHealth)} showValue={!!(row.skuNote)} value={row.skuNote as string} /> },
]

const ingredientColumns: TableColumn[] = [
  { key: 'name', label: 'Ingredient', sortable: true },
  { key: 'skuCode', label: 'SKU', width: 140 },
  { key: 'availability', label: 'Availability', width: 110, align: 'right', render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', color: availabilityColour(v as number) }}>{v as number}%</span> },
  { key: 'capStatus', label: 'Cap status', width: 130, render: (v) => { const s = v as string; return s === 'ok' ? <StatusIndicator status="success" label="Within cap" /> : s === 'monitoring' ? <StatusIndicator status="warning" label="Monitoring" /> : <StatusIndicator status="error" label="Capped" /> } },
  { key: 'isFlagged', label: 'Action', width: 130, render: (v) => v ? <Link href="/tools/recipe-pool-picker/substitution" style={{ textDecoration: 'none' }}><Button variant="outline" color="negative" size="sm" showLeadingIcon leadingIcon={<ErrorOutline />}>Fix</Button></Link> : <MetaText emphasis="tertiary">—</MetaText> },
]

export default function RecipeDetailClient() {
  const router = useRouter()
  const [activeNav, setActiveNav]             = useState('overview')
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0].value)

  return (
    <PageShell
      sidebar={<SideNavigation groups={navGroups} activeId={activeNav} onItemClick={(id) => setActiveNav(id)} user={navUser} theme="dark" />}
      header={<Header title="Recipe Pool Picker" countryDropdown={{ value: selectedCountry, options: countryOptions, onChange: (v) => setSelectedCountry(v) }} />}
    >
      <PageToolbar>
        <Cluster gap={300} align="center" wrap={false}>
          <Button variant="text" color="neutral" size="sm" showLeadingIcon leadingIcon={<ArrowBackOutline />} onClick={() => router.push('/tools/recipe-pool-picker')}>Menu Overview</Button>
          <MetaText emphasis="tertiary">/</MetaText>
          <MetaText emphasis="secondary">{RECIPE.slotLabel}</MetaText>
          <MetaText emphasis="tertiary">/</MetaText>
          <MetaText emphasis="secondary">{RECIPE.name}</MetaText>
        </Cluster>
        {RECIPE.skuIssues > 0 && (
          <Cluster gap={200} align="center" wrap={false} style={{ marginLeft: spacing[400] }}>
            <span className="text-orange-500"><WarningOutline size={16} /></span>
            <MetaText emphasis="secondary">{RECIPE.skuIssues} SKU issue — scroll to Ingredients</MetaText>
          </Cluster>
        )}
      </PageToolbar>

      <PageContent>
        <PageHeader
          title={RECIPE.name}
          subtitle={`${RECIPE.slotLabel} · ${RECIPE.protein} · ${RECIPE.cuisine}`}
          primary={<Button variant="fill" color="positive" size="md" showLeadingIcon leadingIcon={<SwapHorizOutline />}>Swap Recipe</Button>}
          secondary={<Button variant="outline" color="neutral" size="md" onClick={() => router.push('/tools/recipe-pool-picker')}>Back</Button>}
        />

        <Stack gap={800}>
          <Surface tier="section" padding={600}>
            <Stack gap={400}>
              <Cluster gap={600} align="flex-start" wrap>
                <FieldReadOnly label="Protein"          value={RECIPE.protein} />
                <FieldReadOnly label="Cuisine"          value={RECIPE.cuisine} />
                <FieldReadOnly label="Cost per serving" value={RECIPE.costPerServing} />
                <FieldReadOnly label="Slot"             value={RECIPE.slotLabel} />
                <div>
                  <MetaText emphasis="secondary" uppercase style={{ display: 'block', marginBottom: spacing[100] }}>Dietary tags</MetaText>
                  <Cluster gap={200}>
                    {RECIPE.dietaryTags.map(tag => <DisplayChip key={tag} appearance="outline" chipColour="neutral" size="sm">{tag}</DisplayChip>)}
                  </Cluster>
                </div>
              </Cluster>
              <StatusIndicator status="success" label={RECIPE.constraintSummary} />
            </Stack>
          </Surface>

          <Stack gap={300}>
            <SectionHeader title="Variants" count={VARIANTS.length} level="secondary" />
            <Table columns={variantColumns} data={VARIANTS.map(v => ({ ...v } as Record<string, unknown>))} rowKey="id" size="compact" showCount={false} />
          </Stack>

          <Stack gap={300}>
            <SectionHeader
              title="Ingredients"
              count={INGREDIENTS.length}
              level="secondary"
              action={INGREDIENTS.some(i => i.isFlagged) ? (
                <Cluster gap={200} align="center">
                  <span className="text-red-500"><ErrorOutline size={16} /></span>
                  <MetaText emphasis="negative">{INGREDIENTS.filter(i => i.isFlagged).length} ingredient{INGREDIENTS.filter(i => i.isFlagged).length !== 1 ? 's' : ''} need fixing</MetaText>
                </Cluster>
              ) : undefined}
            />
            <Table columns={ingredientColumns} data={INGREDIENTS.map(i => ({ ...i } as Record<string, unknown>))} rowKey="id" size="compact" showCount={false} />
          </Stack>
        </Stack>
      </PageContent>
    </PageShell>
  )
}
