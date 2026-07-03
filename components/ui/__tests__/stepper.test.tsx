import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Stepper } from '../stepper'
import { components } from '@/lib/tokens'

// ── Fixtures ────────────────────────────────────────────────────────────────

const basicSteps = [
  { step: 'Step 1', title: 'Account',  description: 'Create your account'  },
  { step: 'Step 2', title: 'Profile',  description: 'Set up your profile'  },
  { step: 'Step 3', title: 'Confirm',  description: 'Review and confirm'   },
]

// ── Primary use case ─────────────────────────────────────────────────────────

describe('Stepper — primary use case', () => {
  it('renders a nav landmark with accessible label', () => {
    render(<Stepper steps={basicSteps} />)
    expect(screen.getByRole('navigation', { name: 'Progress steps' })).toBeInTheDocument()
  })

  it('renders an ordered list of steps', () => {
    render(<Stepper steps={basicSteps} />)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
  })

  it('renders a screen-reader announcement for every step', () => {
    render(<Stepper steps={basicSteps} activeStep={1} />)
    expect(screen.getByText(/Step 1 of 3: Account \(completed\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 2 of 3: Profile \(active\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 3 of 3: Confirm \(pending\)/i)).toBeInTheDocument()
  })

  it('renders visible titles when showTitle=true (default)', () => {
    render(<Stepper steps={basicSteps} />)
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('renders descriptions when showDescription=true (default)', () => {
    render(<Stepper steps={basicSteps} />)
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('applies a custom aria-label to the nav element', () => {
    render(<Stepper steps={basicSteps} aria-label="Checkout steps" />)
    expect(screen.getByRole('navigation', { name: 'Checkout steps' })).toBeInTheDocument()
  })

  it('forwards className to the outer wrapper', () => {
    const { container } = render(<Stepper steps={basicSteps} className="my-stepper" />)
    expect(container.firstChild).toHaveClass('my-stepper')
  })
})

// ── State derivation ──────────────────────────────────────────────────────────

describe('Stepper — state derivation', () => {
  it('marks steps before activeStep as completed', () => {
    render(<Stepper steps={basicSteps} activeStep={2} />)
    expect(screen.getByText(/Step 1 of 3: Account \(completed\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 2 of 3: Profile \(completed\)/i)).toBeInTheDocument()
  })

  it('marks the activeStep index as active', () => {
    render(<Stepper steps={basicSteps} activeStep={1} />)
    expect(screen.getByText(/Step 2 of 3: Profile \(active\)/i)).toBeInTheDocument()
  })

  it('marks steps after activeStep as pending', () => {
    render(<Stepper steps={basicSteps} activeStep={0} />)
    expect(screen.getByText(/Step 2 of 3: Profile \(pending\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 3 of 3: Confirm \(pending\)/i)).toBeInTheDocument()
  })

  it('respects explicit state override on a step item', () => {
    const stepsWithOverride = [
      { title: 'Alpha', state: 'error' as const },
      { title: 'Beta' },
    ]
    render(<Stepper steps={stepsWithOverride} activeStep={0} />)
    expect(screen.getByText(/Alpha \(error\)/i)).toBeInTheDocument()
  })
})

// ── onStepClick interaction ───────────────────────────────────────────────────

describe('Stepper — onStepClick', () => {
  it('renders completed steps as buttons when onStepClick is provided', () => {
    const handleClick = vi.fn()
    render(<Stepper steps={basicSteps} activeStep={2} onStepClick={handleClick} />)
    // Steps 0 and 1 are completed → should be buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('calls onStepClick with the correct index when a completed step is clicked', () => {
    const handleClick = vi.fn()
    render(<Stepper steps={basicSteps} activeStep={2} onStepClick={handleClick} />)
    const firstStepButton = screen.getByRole('button', { name: /Go to step 1: Account/i })
    fireEvent.click(firstStepButton)
    expect(handleClick).toHaveBeenCalledWith(0)
  })

  it('does not render buttons when onStepClick is not provided', () => {
    render(<Stepper steps={basicSteps} activeStep={2} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('sets aria-current="step" on the active step button', () => {
    const handleClick = vi.fn()
    render(<Stepper steps={basicSteps} activeStep={1} onStepClick={handleClick} />)
    const activeButton = screen.getByRole('button', { name: /Go to step 2: Profile/i })
    expect(activeButton).toHaveAttribute('aria-current', 'step')
  })

  it('does not set aria-current on non-active step buttons', () => {
    const handleClick = vi.fn()
    render(<Stepper steps={basicSteps} activeStep={2} onStepClick={handleClick} />)
    const completedButton = screen.getByRole('button', { name: /Go to step 1: Account/i })
    expect(completedButton).not.toHaveAttribute('aria-current')
  })

  it('pending steps are not interactive even when onStepClick is provided', () => {
    const handleClick = vi.fn()
    render(<Stepper steps={basicSteps} activeStep={0} onStepClick={handleClick} />)
    // Only step 0 is active — steps 1 and 2 are pending → no button
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(1) // only the active step
  })
})

// ── Visibility toggles ────────────────────────────────────────────────────────

describe('Stepper — visibility props', () => {
  it('hides step labels when showStep=false', () => {
    render(<Stepper steps={basicSteps} showStep={false} />)
    expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
  })

  it('hides titles when showTitle=false', () => {
    render(<Stepper steps={basicSteps} showTitle={false} />)
    // Titles in sr-only spans still exist; visible spans should not be present
    const visible = screen.queryAllByText('Account')
    // sr-only spans are still rendered for a11y, but we check visible ones are absent
    visible.forEach(el => {
      expect(el.closest('.sr-only') !== null || el.className.includes('sr-only') ||
        window.getComputedStyle(el).position === 'absolute').toBeTruthy()
    })
  })

  it('hides descriptions when showDescription=false', () => {
    render(<Stepper steps={basicSteps} showDescription={false} />)
    expect(screen.queryByText('Create your account')).not.toBeInTheDocument()
  })

  it('does not render description span when step has no description', () => {
    const stepsNoDesc = [{ title: 'Only title' }]
    render(<Stepper steps={stepsNoDesc} showDescription />)
    // No crash and nothing to check beyond step title presence
    expect(screen.getByText('Only title')).toBeInTheDocument()
  })
})

// ── Orientation ───────────────────────────────────────────────────────────────

describe('Stepper — orientation', () => {
  it('renders without error in vertical orientation', () => {
    render(<Stepper steps={basicSteps} orientation="vertical" />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders without error in horizontal orientation (default)', () => {
    render(<Stepper steps={basicSteps} orientation="horizontal" />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})

// ── Size variants ─────────────────────────────────────────────────────────────

describe('Stepper — size', () => {
  it.each(['sm', 'md', 'lg'] as const)('renders without error at size=%s', (size) => {
    expect(() => render(<Stepper steps={basicSteps} size={size} />)).not.toThrow()
  })
})

// ── Theme variants ────────────────────────────────────────────────────────────

describe('Stepper — theme', () => {
  it('renders without error in dark theme', () => {
    expect(() => render(<Stepper steps={basicSteps} theme="dark" />)).not.toThrow()
  })

  it('renders without error in light theme', () => {
    expect(() => render(<Stepper steps={basicSteps} theme="light" />)).not.toThrow()
  })
})

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('Stepper — edge cases', () => {
  it('renders an empty stepper without crashing when steps=[]', () => {
    expect(() => render(<Stepper steps={[]} />)).not.toThrow()
  })

  it('renders a single-step stepper without a connector', () => {
    render(<Stepper steps={[{ title: 'Solo step' }]} />)
    expect(screen.getByText('Solo step')).toBeInTheDocument()
  })

  it('handles activeStep beyond the last index without crashing', () => {
    expect(() =>
      render(<Stepper steps={basicSteps} activeStep={99} />)
    ).not.toThrow()
  })

  it('handles activeStep=-1 without crashing (all steps pending)', () => {
    expect(() =>
      render(<Stepper steps={basicSteps} activeStep={-1} />)
    ).not.toThrow()
  })

  it('renders correctly when a step has a very long title', () => {
    const longTitle = 'A'.repeat(300)
    const steps = [{ title: longTitle }, { title: 'Short' }]
    expect(() => render(<Stepper steps={steps} />)).not.toThrow()
    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('renders the error state icon for an explicitly errored step', () => {
    const stepsWithError = [
      { title: 'Broken step', state: 'error' as const },
      { title: 'Next step' },
    ]
    render(<Stepper steps={stepsWithError} />)
    // The sr-only span must announce the error state
    expect(screen.getByText(/Broken step \(error\)/i)).toBeInTheDocument()
  })

  it('renders all four step states without crashing', () => {
    const allStates = [
      { title: 'Pending',   state: 'pending'   as const },
      { title: 'Active',    state: 'active'    as const },
      { title: 'Completed', state: 'completed' as const },
      { title: 'Error',     state: 'error'     as const },
    ]
    expect(() => render(<Stepper steps={allStates} />)).not.toThrow()
  })

  it('does not render step label when step.step is omitted even with showStep=true', () => {
    const stepsNoLabel = [{ title: 'No label' }]
    render(<Stepper steps={stepsNoLabel} showStep />)
    // 'Step 1' text should not appear since step.step is undefined
    expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
  })

  it('position=left renders without error in horizontal layout', () => {
    expect(() =>
      render(<Stepper steps={basicSteps} orientation="horizontal" position="left" />)
    ).not.toThrow()
  })

  it('position=right renders without error in vertical layout', () => {
    expect(() =>
      render(<Stepper steps={basicSteps} orientation="vertical" position="right" />)
    ).not.toThrow()
  })
})

// ── Token references ──────────────────────────────────────────────────────────

describe('Stepper — tokens', () => {
  it('light theme active circle uses components.stepper.colour.light.circleActive.bg', () => {
    const handleClick = vi.fn()
    render(<Stepper steps={basicSteps} activeStep={0} theme="light" onStepClick={handleClick} />)
    const activeBtn = screen.getByRole('button', { name: /Go to step 1: Account/i })
    expect(activeBtn).toHaveStyle({
      backgroundColor: components.stepper.colour.light.circleActive.bg,
    })
  })

  it('dark theme error circle uses #FE8680 (red[400]), not the unregistered #FF7575', () => {
    expect(components.stepper.colour.dark.circleError.bg).toBe('#FE8680')
    expect(components.stepper.colour.dark.circleError.bg).not.toBe('#FF7575')
  })

  it('dark theme error title uses #FE8680 (red[400]), not the unregistered #FF7575', () => {
    expect(components.stepper.colour.dark.titleError).toBe('#FE8680')
    expect(components.stepper.colour.dark.titleError).not.toBe('#FF7575')
  })

  it('focus outline on active button matches components.stepper.colour.light.focusColor', () => {
    const handleClick = vi.fn()
    render(<Stepper steps={basicSteps} activeStep={0} theme="light" onStepClick={handleClick} />)
    const activeBtn = screen.getByRole('button', { name: /Go to step 1: Account/i })
    expect(activeBtn).toHaveStyle({
      outlineColor: components.stepper.colour.light.focusColor,
    })
  })
})
