import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Accordion } from '../accordion';
import type { AccordionItemData } from '../accordion';

const items: AccordionItemData[] = [
  { id: 'a', title: 'Item A', content: <p>Content A</p> },
  { id: 'b', title: 'Item B', content: <p>Content B</p> },
  { id: 'c', title: 'Item C', content: <p>Content C</p>, disabled: true },
];

describe('Accordion', () => {
  // ── Primary: collapses all by default ───────────────────────────────────────
  it('renders all items collapsed by default', () => {
    render(<Accordion items={items} />);
    expect(screen.queryByText('Content A')).not.toBeVisible();
    expect(screen.queryByText('Content B')).not.toBeVisible();
  });

  // ── Expands on click ─────────────────────────────────────────────────────────
  it('expands an item when its trigger is clicked', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Item A' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'true');
  });

  // ── Collapses on second click ────────────────────────────────────────────────
  it('collapses an expanded item when clicked again', () => {
    render(<Accordion items={items} />);
    const btn = screen.getByRole('button', { name: 'Item A' });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  // ── Single open mode (default) ───────────────────────────────────────────────
  it('closes the previous item when a new one is opened (allowMultiple=false)', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Item A' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Item B' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Item B' })).toHaveAttribute('aria-expanded', 'true');
  });

  // ── allowMultiple ────────────────────────────────────────────────────────────
  it('allows multiple items open when allowMultiple=true', () => {
    render(<Accordion items={items} allowMultiple />);
    fireEvent.click(screen.getByRole('button', { name: 'Item A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Item B' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Item B' })).toHaveAttribute('aria-expanded', 'true');
  });

  // ── defaultOpen ─────────────────────────────────────────────────────────────
  it('opens specified items by default via defaultOpen', () => {
    render(<Accordion items={items} defaultOpen={['b']} />);
    expect(screen.getByRole('button', { name: 'Item B' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'false');
  });

  // ── Disabled item ────────────────────────────────────────────────────────────
  it('does not expand a disabled item', () => {
    render(<Accordion items={items} />);
    const disabledBtn = screen.getByRole('button', { name: 'Item C' });
    expect(disabledBtn).toBeDisabled();
    fireEvent.click(disabledBtn);
    expect(disabledBtn).toHaveAttribute('aria-expanded', 'false');
  });

  // ── ARIA: region + labelledby ────────────────────────────────────────────────
  it('associates panel region with its trigger via aria-labelledby', () => {
    render(<Accordion items={items} defaultOpen={['a']} />);
    const trigger = screen.getByRole('button', { name: 'Item A' });
    const panel = screen.getByRole('region', { name: 'Item A' });
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
  });

  // ── Subtitle rendered ────────────────────────────────────────────────────────
  it('renders subtitle when provided', () => {
    const withSubtitle: AccordionItemData[] = [
      { id: 'x', title: 'Main', subtitle: 'Supporting text', content: 'Body' },
    ];
    render(<Accordion items={withSubtitle} />);
    expect(screen.getByText('Supporting text')).toBeInTheDocument();
  });

  // ── Flush variant: no border ─────────────────────────────────────────────────
  it('renders flush variant without outlined container class', () => {
    const { container } = render(<Accordion items={items} variant="flush" />);
    expect(container.firstChild).not.toHaveClass('border');
  });

  // ── chevronPosition='left' ───────────────────────────────────────────────────
  it('renders the chevron on the left when chevronPosition="left"', () => {
    const { container } = render(<Accordion items={items} chevronPosition="left" />);
    const trigger = container.querySelector('button') as HTMLButtonElement;
    // When chevronPosition is 'left', the chevron span is the first child of the button
    const firstSpan = trigger.querySelector('span');
    expect(firstSpan).toHaveClass('-rotate-90');
  });

  // ── leadingIcon slot ─────────────────────────────────────────────────────────
  it('renders a leading icon when provided', () => {
    const withIcon: AccordionItemData[] = [
      { id: 'icon', title: 'With Icon', content: 'Body', leadingIcon: <span data-testid="lead-icon" /> },
    ];
    render(<Accordion items={withIcon} />);
    expect(screen.getByTestId('lead-icon')).toBeInTheDocument();
  });

  // ── empty items ──────────────────────────────────────────────────────────────
  it('renders without crashing when items is empty', () => {
    const { container } = render(<Accordion items={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  // ── aria-hidden on collapsed panels ─────────────────────────────────────────
  it('sets aria-hidden on collapsed panel content', () => {
    render(<Accordion items={items} />);
    // Item A is collapsed by default — its animated wrapper should be aria-hidden
    const trigger = screen.getByRole('button', { name: 'Item A' });
    const panelId = trigger.getAttribute('aria-controls') as string;
    const panel = document.getElementById(panelId) as HTMLElement;
    // The motion.div wrapping the panel carries aria-hidden when closed
    expect(panel.parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});
