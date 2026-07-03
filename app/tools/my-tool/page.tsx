'use client'

/**
 * Example tool page — Table View template (sage-rules.mdc §4.1)
 * Replace this with your actual tool content.
 *
 * To rename the tool:
 *   1. Update the `title` prop on <Header>
 *   2. Update the `title` prop on <PageHeader>
 *   3. Rename this folder from `my-tool` to your tool name (kebab-case)
 *   4. Update app/page.tsx redirect to match the new path
 */

import { useState } from 'react'
import { PageShell, PageContent, PageHeader, Stack } from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import type { SideNavGroup, SideNavUser } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Chip } from '@/components/ui/chip'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { HomeOutline, HomeFilled, AnalyticsOutline, SearchOutline } from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'

// ─── Nav config ───────────────────────────────────────────────────────────────

const navGroups: SideNavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'overview',   label: 'Overview',   icon: <HomeOutline />,      href: '/tools/my-tool' },
      { id: 'analytics',  label: 'Analytics',  icon: <AnalyticsOutline />, href: '/tools/my-tool/analytics' },
    ],
  },
]

const navUser: SideNavUser = {
  name:  'Jane Smith',
  role:  'Menu Planner',
  email: 'jane.smith@hellofresh.com',
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id:         `ITEM-${String(i + 1).padStart(3, '0')}`,
  name:       ['Spaghetti Bolognese', 'Chicken Tikka Masala', 'Mushroom Risotto', 'Beef Tacos', 'Salmon Teriyaki', 'Caesar Salad', 'Lentil Soup', 'Veggie Stir Fry', 'Lamb Chops', 'Prawn Noodles', 'Caprese Salad', 'Pulled Pork'][i],
  category:   ['Pasta', 'Curry', 'Risotto', 'Mexican', 'Fish', 'Salad', 'Soup', 'Asian', 'Meat', 'Noodles', 'Salad', 'BBQ'][i],
  status:     ['Active', 'Active', 'Draft', 'Active', 'Active', 'Draft', 'Archived', 'Active', 'Active', 'Draft', 'Active', 'Active'][i],
  updated:    `2026-06-${String(i + 1).padStart(2, '0')}`,
}))

const columns = [
  { key: 'id',       header: 'ID',       sortable: true,  width: 120 },
  { key: 'name',     header: 'Name',     sortable: true },
  { key: 'category', header: 'Category', sortable: true,  width: 140 },
  {
    key:    'status',
    header: 'Status',
    width:  120,
    render: (value: unknown) => {
      const v = value as string
      const variant = v === 'Active' ? 'success' : v === 'Draft' ? 'warning' : 'info'
      return <StatusIndicator status={variant as 'success' | 'warning' | 'info'} label={v} />
    },
  },
  { key: 'updated',  header: 'Updated',  sortable: true,  width: 120 },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyToolPage() {
  const [activeNav, setActiveNav] = useState('overview')
  const [page, setPage]           = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const pageData = MOCK_ITEMS.slice((page - 1) * rowsPerPage, page * rowsPerPage)

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
          title="My Tool"
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
          title="All Items"
          subtitle="Manage and review your items"
          primary={
            <Button variant="fill" color="positive" size="md">
              Add item
            </Button>
          }
          secondary={
            <Button variant="outline" color="neutral" size="md">
              Export
            </Button>
          }
        />

        <Stack gap={600}>
          <Table
            title="Items"
            showCount
            columns={columns}
            data={pageData}
            searchable
            searchPlaceholder="Search items…"
            filterButton
            size="comfortable"
          />

          <Pagination
            totalItems={MOCK_ITEMS.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            showRowsPerPage
            showRangeText
          />
        </Stack>
      </PageContent>
    </PageShell>
  )
}
