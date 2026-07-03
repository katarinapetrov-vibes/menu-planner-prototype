'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PageShell, PageContent, Stack, Cluster, Surface,
  SectionHeader, FieldReadOnly, BodyText, MetaText, DataTable,
} from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import type { SideNavGroup, SideNavUser } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Wizard } from '@/components/ui/wizard'
import type { WizardStep } from '@/components/ui/wizard'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { DisplayChip } from '@/components/ui/chip'
import { Snackbar } from '@/components/ui/snackbar'
import { DashboardOutline, ErrorOutline, CheckCircleOutline, CheckOutline } from '@/components/ui/icons'
import { countryOptions } from '@/data/countries'
import { semantic, spacing } from '@/lib/tokens'

const navGroups: SideNavGroup[] = [{ id: 'main', items: [{ id: 'overview', label: 'Menu Overview', icon: <DashboardOutline />, href: '/tools/recipe-pool-picker' }] }]
const navUser: SideNavUser = { name: 'Anna Fischer', role: 'Menu Planner', email: 'anna.fischer@hellofresh.com' }

const FLAGGED = { name: 'Avocado', skuCode: 'SKU-AV-0044', issueType: 'Capped', availability: 41, affectedVersions: [
  { id: 'v1', name: 'Tex-Mex Beef Tacos — Base',         market: 'DE' },
  { id: 'v2', name: 'Tex-Mex Beef Tacos — Calorie Smart', market: 'DE' },
  { id: 'v3', name: 'Tex-Mex Beef Tacos — Family',        market: 'DE' },
]}

type TagImpact = 'none' | 'at-risk' | 'broken'
interface Candidate { id: string; name: string; skuCode: string; availability: number; costDelta: string; costDeltaDir: 'up' | 'down' | 'neutral'; tagImpacts: { tag: string; impact: TagImpact }[] }

const CANDIDATES: Candidate[] = [
  { id: 'c1', name: 'Mango salsa',        skuCode: 'SKU-FR-0091', availability: 96, costDelta: '+€0.12', costDeltaDir: 'up',   tagImpacts: [{ tag: 'Family-friendly', impact: 'none' }, { tag: 'Pork-free', impact: 'none' }, { tag: 'Calorie Smart', impact: 'at-risk' }] },
  { id: 'c2', name: 'Guacamole (pre-made)', skuCode: 'SKU-SC-0188', availability: 84, costDelta: '+€0.31', costDeltaDir: 'up',  tagImpacts: [{ tag: 'Family-friendly', impact: 'none' }, { tag: 'Pork-free', impact: 'none' }, { tag: 'Calorie Smart', impact: 'broken' }] },
  { id: 'c3', name: 'Roasted corn salsa',  skuCode: 'SKU-VG-0214', availability: 99, costDelta: '−€0.04', costDeltaDir: 'down', tagImpacts: [{ tag: 'Family-friendly', impact: 'none' }, { tag: 'Pork-free', impact: 'none' }, { tag: 'Calorie Smart', impact: 'none' }] },
]

function tagStatus(i: TagImpact): 'success' | 'warning' | 'error' { return i === 'none' ? 'success' : i === 'at-risk' ? 'warning' : 'error' }
function tagLabel(i: TagImpact)  { return i === 'none' ? 'No change' : i === 'at-risk' ? 'At risk' : 'Broken' }
function availColour(p: number)  { return p >= 80 ? semantic.foreground.positive.default.light : p >= 60 ? semantic.foreground.warning.default.light : semantic.foreground.negative.default.light }
function deltaColour(d: 'up'|'down'|'neutral') { return d === 'down' ? semantic.foreground.positive.default.light : d === 'up' ? semantic.foreground.negative.default.light : semantic.foreground.default.secondary.light }

function Step1() {
  return (
    <Stack gap={600}>
      <Surface tier="section" padding={600}>
        <Stack gap={400}>
          <Cluster gap={200} align="center">
            <span className="text-red-500"><ErrorOutline size={20} /></span>
            <BodyText weight="semi" density="compact">{FLAGGED.name} — {FLAGGED.issueType}</BodyText>
          </Cluster>
          <Cluster gap={600} wrap>
            <FieldReadOnly label="SKU code"           value={FLAGGED.skuCode} />
            <FieldReadOnly label="Issue type"         value={FLAGGED.issueType} />
            <FieldReadOnly label="Availability"       value={<span style={{ fontVariantNumeric: 'tabular-nums', color: availColour(FLAGGED.availability) }}>{FLAGGED.availability}%</span>} />
            <FieldReadOnly label="Affected versions"  value={String(FLAGGED.affectedVersions.length)} />
          </Cluster>
        </Stack>
      </Surface>
      <Stack gap={300}>
        <SectionHeader title="Affected versions" level="secondary" />
        <DataTable density="compact">
          <thead><tr><th>Version name</th><th>Market</th></tr></thead>
          <tbody>{FLAGGED.affectedVersions.map(v => (
            <tr key={v.id}><td><BodyText density="compact">{v.name}</BodyText></td><td><DisplayChip appearance="outline" chipColour="neutral" size="sm">{v.market}</DisplayChip></td></tr>
          ))}</tbody>
        </DataTable>
      </Stack>
    </Stack>
  )
}

function Step2({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <Stack gap={400}>
      {CANDIDATES.map(c => {
        const sel = selectedId === c.id
        return (
          <div key={c.id} role="button" tabIndex={0} onClick={() => onSelect(c.id)} onKeyDown={e => e.key === 'Enter' && onSelect(c.id)} style={{ cursor: 'pointer' }}>
            <Surface tier={sel ? 'selected' : 'raised'} padding={500} style={{ borderLeft: sel ? `3px solid ${semantic.border.positive.light}` : '3px solid transparent', pointerEvents: 'none' }}>
              <Stack gap={300}>
                <Cluster justify="space-between" align="flex-start" wrap={false}>
                  <Stack gap={100}>
                    <BodyText weight="semi" density="compact">{c.name}</BodyText>
                    <MetaText emphasis="tertiary">{c.skuCode}</MetaText>
                  </Stack>
                  <Cluster gap={400} align="center" wrap={false}>
                    <Stack gap={50}>
                      <MetaText emphasis="tertiary" uppercase>Availability</MetaText>
                      <BodyText density="compact" weight="semi" style={{ fontVariantNumeric: 'tabular-nums', color: availColour(c.availability) }}>{c.availability}%</BodyText>
                    </Stack>
                    <Stack gap={50}>
                      <MetaText emphasis="tertiary" uppercase>Cost delta</MetaText>
                      <BodyText density="compact" weight="semi" style={{ fontVariantNumeric: 'tabular-nums', color: deltaColour(c.costDeltaDir) }}>{c.costDelta}</BodyText>
                    </Stack>
                  </Cluster>
                </Cluster>
                <Cluster gap={300} wrap>{c.tagImpacts.map(ti => <StatusIndicator key={ti.tag} status={tagStatus(ti.impact)} label={`${ti.tag}: ${tagLabel(ti.impact)}`} />)}</Cluster>
                {sel && <Cluster gap={200} align="center"><span className="text-emerald-500"><CheckOutline size={16} /></span><MetaText emphasis="positive">Selected</MetaText></Cluster>}
              </Stack>
            </Surface>
          </div>
        )
      })}
    </Stack>
  )
}

function Step3({ candidate }: { candidate: Candidate | null }) {
  if (!candidate) return null
  const versions = FLAGGED.affectedVersions.map(v => ({ ...v, costDelta: candidate.costDelta, costDeltaDir: candidate.costDeltaDir, tagChanges: candidate.tagImpacts, newViolations: candidate.tagImpacts.filter(t => t.impact === 'broken').length }))
  const totalViolations = versions.reduce((s, v) => s + v.newViolations, 0)
  return (
    <Stack gap={600}>
      <Surface tier="section" padding={500}>
        <Cluster gap={600} wrap>
          <FieldReadOnly label="Replacing"               value={FLAGGED.name} />
          <FieldReadOnly label="With"                    value={candidate.name} />
          <FieldReadOnly label="Versions affected"       value={String(versions.length)} />
          <FieldReadOnly label="New constraint violations" value={<span style={{ fontVariantNumeric: 'tabular-nums', color: totalViolations > 0 ? semantic.foreground.negative.default.light : semantic.foreground.positive.default.light }}>{totalViolations}</span>} />
        </Cluster>
      </Surface>
      <Stack gap={300}>
        <SectionHeader title="Impact per version" level="secondary" />
        <DataTable density="compact">
          <thead><tr><th>Version</th><th>Market</th><th>Cost delta</th><th>Tag impact</th><th>New violations</th></tr></thead>
          <tbody>{versions.map(v => (
            <tr key={v.id}>
              <td><BodyText density="compact">{v.name}</BodyText></td>
              <td><DisplayChip appearance="outline" chipColour="neutral" size="sm">{v.market}</DisplayChip></td>
              <td><BodyText density="compact" style={{ fontVariantNumeric: 'tabular-nums', color: deltaColour(v.costDeltaDir) }}>{v.costDelta}</BodyText></td>
              <td><Cluster gap={200} wrap>{v.tagChanges.filter(t => t.impact !== 'none').length > 0 ? v.tagChanges.filter(t => t.impact !== 'none').map(t => <StatusIndicator key={t.tag} status={tagStatus(t.impact)} label={`${t.tag}: ${tagLabel(t.impact)}`} />) : <StatusIndicator status="success" label="No tag changes" />}</Cluster></td>
              <td><span style={{ fontVariantNumeric: 'tabular-nums', color: v.newViolations > 0 ? semantic.foreground.negative.default.light : semantic.foreground.positive.default.light }}>{v.newViolations}</span></td>
            </tr>
          ))}</tbody>
        </DataTable>
      </Stack>
    </Stack>
  )
}

function Step4({ candidate }: { candidate: Candidate | null }) {
  if (!candidate) return null
  const n = FLAGGED.affectedVersions.length
  return (
    <Stack gap={600}>
      <Surface tier="section" padding={600}>
        <Stack gap={400}>
          <SectionHeader title="What will change" level="secondary" />
          <Cluster gap={600} wrap>
            <FieldReadOnly label="Ingredient out"       value={FLAGGED.name} />
            <FieldReadOnly label="Ingredient in"        value={candidate.name} />
            <FieldReadOnly label="Versions updated"     value={String(n)} />
            <FieldReadOnly label="Fields updated"       value="Picks, ingredients, steps, nutritional data" />
          </Cluster>
        </Stack>
      </Surface>
      <Surface tier="section" padding={600}>
        <Stack gap={400}>
          <SectionHeader title="What stays the same" level="secondary" />
          <Cluster gap={300} wrap>
            {['Recipe name','Slot assignment','Cuisine','Protein'].map(item => (
              <Cluster key={item} gap={200} align="center">
                <span className="text-emerald-500"><CheckCircleOutline size={16} /></span>
                <BodyText density="compact">{item}</BodyText>
              </Cluster>
            ))}
          </Cluster>
        </Stack>
      </Surface>
      <Surface tier="section" padding={600}>
        <Stack gap={400}>
          <SectionHeader title="Change log entry preview" level="secondary" />
          <Surface tier="sunken" padding={400}>
            <Stack gap={200}>
              <Cluster gap={200} align="center">
                <MetaText emphasis="tertiary" style={{ fontVariantNumeric: 'tabular-nums' }}>2026-07-03</MetaText>
                <MetaText emphasis="tertiary">·</MetaText>
                <MetaText emphasis="secondary">Ingredient substitution</MetaText>
              </Cluster>
              <BodyText density="compact"><strong>{FLAGGED.name}</strong> replaced with <strong>{candidate.name}</strong> across {n} version{n !== 1 ? 's' : ''} of Tex-Mex Beef Tacos (Slot 3).</BodyText>
              <MetaText emphasis="tertiary">Reason: weekly SKU cap reached ({FLAGGED.skuCode}). Applied by Anna Fischer.</MetaText>
            </Stack>
          </Surface>
        </Stack>
      </Surface>
    </Stack>
  )
}

export default function SubstitutionWizardPage() {
  const router = useRouter()
  const [activeNav, setActiveNav]             = useState('overview')
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0].value)
  const [selectedId, setSelectedId]           = useState<string | null>(null)
  const [showSuccess, setShowSuccess]         = useState(false)
  const [currentStep, setCurrentStep]         = useState(0)

  const candidate = CANDIDATES.find(c => c.id === selectedId) ?? null

  const steps: WizardStep[] = [
    { title: 'Issue',         heading: "What's the problem?",                  subheading: 'Review the flagged ingredient and affected versions.',                                                         content: <Step1 /> },
    { title: 'Substitute',    heading: 'Which ingredient will you use instead?', subheading: 'Select a substitute. Availability, cost delta, and dietary tag impact shown for each candidate.',            content: <Step2 selectedId={selectedId} onSelect={setSelectedId} /> },
    { title: 'Review impact', heading: 'Does this substitution work across all versions?', subheading: 'Check cost deltas, dietary tag changes, and new constraint violations.',                           content: <Step3 candidate={candidate} /> },
    { title: 'Confirm',       heading: 'Ready to apply?',                       subheading: 'This will update picks, ingredients, steps, and nutritional data across all affected versions.',              content: <Step4 candidate={candidate} /> },
  ]

  function handleComplete() {
    setShowSuccess(true)
    setTimeout(() => router.push('/tools/recipe-pool-picker/recipe/s3'), 1800)
  }

  return (
    <PageShell
      sidebar={<SideNavigation groups={navGroups} activeId={activeNav} onItemClick={(id) => setActiveNav(id)} user={navUser} theme="dark" />}
      header={<Header title="Recipe Pool Picker" countryDropdown={{ value: selectedCountry, options: countryOptions, onChange: (v) => setSelectedCountry(v) }} />}
      footer={null}
    >
      <PageContent style={{ padding: 0 }}>
        <Wizard
          variant="page"
          title="Ingredient Substitution"
          description={`${FLAGGED.name} → Tex-Mex Beef Tacos (Slot 3)`}
          steps={steps}
          activeStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={handleComplete}
          onClose={() => router.push('/tools/recipe-pool-picker/recipe/s3')}
          cancelLabel="Cancel"
          nextLabel="Next"
          completeLabel="Apply Substitution"
          nextDisabled={currentStep === 1 && !selectedId}
          scrollable
          style={{ minHeight: '100%' }}
        />
        {showSuccess && (
          <div style={{ position: 'fixed', bottom: spacing[600], left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            <Snackbar message="Substitution applied across 3 versions" type="success" open={showSuccess} onClose={() => setShowSuccess(false)} />
          </div>
        )}
      </PageContent>
    </PageShell>
  )
}
