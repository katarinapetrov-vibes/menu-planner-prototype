/**
 * Divider component — Vitest unit tests
 *
 * Covers:
 *  - Primary use case: renders horizontal solid divider with default props
 *  - Edge case 1: label variant renders text and two flanking line segments
 *  - Edge case 2: dot variant renders aria-hidden dot, no label text
 *  - Edge case 3: vertical orientation sets correct class and aria-orientation
 *  - Edge case 4: dashed style applies borderStyle="dashed" inline
 *  - Edge case 5: vertical + label — label is silently dropped, plain line rendered
 *  - Edge case 6: forwardRef correctly attaches to the root div
 *  - Edge case 7: custom className is merged onto the root element
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './divider';

// ── Primary use case ──────────────────────────────────────────────────────────

describe('Divider — primary use case', () => {
  it('renders with role="separator"', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('defaults to horizontal orientation via aria-orientation', () => {
    render(<Divider />);
    const el = screen.getByRole('separator');
    expect(el.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('applies the w-full and border-t Tailwind classes for plain horizontal', () => {
    render(<Divider />);
    const el = screen.getByRole('separator');
    expect(el.className).toContain('w-full');
    expect(el.className).toContain('border-t');
  });

  it('applies solid borderStyle via inline style by default', () => {
    render(<Divider />);
    const el = screen.getByRole('separator') as HTMLElement;
    expect((el as HTMLElement).style.borderStyle).toBe('solid');
  });

  it('defaults to light shade (borderColor matches light/default token)', () => {
    render(<Divider />);
    const lightColor = (screen.getByRole('separator') as HTMLElement).style.borderColor;
    const { unmount } = render(<Divider shade="dark" />);
    const els = screen.getAllByRole('separator');
    const darkColor = (els[els.length - 1] as HTMLElement).style.borderColor;
    expect(lightColor).not.toBe('');
    expect(darkColor).not.toBe('');
    expect(lightColor).not.toBe(darkColor);
    unmount();
  });
});

// ── Edge case 1: label variant ────────────────────────────────────────────────

describe('Divider — label variant (edge case 1)', () => {
  it('renders the label text', () => {
    render(<Divider label="Section" />);
    expect(screen.getByText('Section')).toBeTruthy();
  });

  it('renders exactly two flanking line div elements alongside the label', () => {
    const { container } = render(<Divider label="OR" />);
    const root = screen.getByRole('separator');
    // Root is a flex container; children: line div | span(label) | line div
    const lineDivs = Array.from(root.children).filter(
      (el) => el.tagName === 'DIV'
    );
    expect(lineDivs).toHaveLength(2);
  });

  it('each flanking line carries borderStyle in its inline style', () => {
    const { container } = render(<Divider label="OR" style="dashed" />);
    const root = screen.getByRole('separator');
    const lineDivs = Array.from(root.children).filter(
      (el) => el.tagName === 'DIV'
    ) as HTMLElement[];
    for (const line of lineDivs) {
      expect(line.style.borderStyle).toBe('dashed');
    }
  });

  it('long label text does not crash and label is still present', () => {
    const longLabel = 'A'.repeat(300);
    render(<Divider label={longLabel} />);
    expect(screen.getByText(longLabel)).toBeTruthy();
  });

  it('empty string label falls back to plain horizontal divider (no flanking lines)', () => {
    render(<Divider label="" />);
    const el = screen.getByRole('separator');
    // An empty string is falsy — hasCenterContent = false → plain divider path
    expect(el.className).toContain('w-full');
  });

  it('sets aria-label on the separator root when a label is provided', () => {
    render(<Divider label="OR" />);
    expect(screen.getByRole('separator').getAttribute('aria-label')).toBe('OR');
  });
});

// ── Edge case 2: dot variant ──────────────────────────────────────────────────

describe('Divider — dot variant (edge case 2)', () => {
  it('renders an aria-hidden dot element when dot=true', () => {
    const { container } = render(<Divider dot />);
    const root = screen.getByRole('separator');
    const dotSpan = root.querySelector('span[aria-hidden]');
    expect(dotSpan).not.toBeNull();
  });

  it('dot element has a non-zero width set via inline style', () => {
    const { container } = render(<Divider dot size="md" />);
    const root = screen.getByRole('separator');
    const dotSpan = root.querySelector('span[aria-hidden]') as HTMLElement;
    // md dot = 8px
    expect(dotSpan.style.width).toBe('8px');
    expect(dotSpan.style.height).toBe('8px');
  });

  it('dot size sm renders 4px dot', () => {
    const { container } = render(<Divider dot size="sm" />);
    const dotSpan = screen
      .getByRole('separator')
      .querySelector('span[aria-hidden]') as HTMLElement;
    expect(dotSpan.style.width).toBe('4px');
  });

  it('dot size lg renders 12px dot', () => {
    const { container } = render(<Divider dot size="lg" />);
    const dotSpan = screen
      .getByRole('separator')
      .querySelector('span[aria-hidden]') as HTMLElement;
    expect(dotSpan.style.width).toBe('12px');
  });

  it('dot has rounded-full class', () => {
    const { container } = render(<Divider dot />);
    const dotSpan = screen
      .getByRole('separator')
      .querySelector('span[aria-hidden]') as HTMLElement;
    expect(dotSpan.className).toContain('rounded-full');
  });

  it('label takes priority over dot when both are supplied', () => {
    render(<Divider label="Priority" dot />);
    // Should render the label span, NOT an aria-hidden dot
    expect(screen.getByText('Priority')).toBeTruthy();
    expect(
      screen.getByRole('separator').querySelector('span[aria-hidden]')
    ).toBeNull();
  });
});

// ── Edge case 3: vertical orientation ────────────────────────────────────────

describe('Divider — vertical orientation (edge case 3)', () => {
  it('sets aria-orientation="vertical"', () => {
    render(<Divider orientation="vertical" />);
    expect(
      screen.getByRole('separator').getAttribute('aria-orientation')
    ).toBe('vertical');
  });

  it('applies self-stretch and border-l classes', () => {
    render(<Divider orientation="vertical" />);
    const el = screen.getByRole('separator');
    expect(el.className).toContain('self-stretch');
    expect(el.className).toContain('border-l');
  });

  it('vertical divider does NOT have w-full class', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator').className).not.toContain('w-full');
  });
});

// ── Edge case 4: dashed style ─────────────────────────────────────────────────

describe('Divider — dashed style (edge case 4)', () => {
  it('plain horizontal dashed divider applies borderStyle="dashed"', () => {
    render(<Divider style="dashed" />);
    const el = screen.getByRole('separator') as HTMLElement;
    expect(el.style.borderStyle).toBe('dashed');
  });

  it('vertical dashed divider applies borderLeftStyle="dashed"', () => {
    render(<Divider orientation="vertical" style="dashed" />);
    const el = screen.getByRole('separator') as HTMLElement;
    expect(el.style.borderLeftStyle).toBe('dashed');
  });
});

// ── Edge case 5: vertical + label (label silently dropped) ────────────────────

describe('Divider — vertical + label (edge case 5)', () => {
  it('renders a plain vertical divider and does not render the label text', () => {
    render(<Divider orientation="vertical" label="Hidden" />);
    // vertical branch does not handle hasCenterContent — label not rendered
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('still sets aria-orientation="vertical"', () => {
    render(<Divider orientation="vertical" label="Hidden" />);
    expect(
      screen.getByRole('separator').getAttribute('aria-orientation')
    ).toBe('vertical');
  });
});

// ── Edge case 6: forwardRef ───────────────────────────────────────────────────

describe('Divider — forwardRef (edge case 6)', () => {
  it('attaches a ref to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Divider ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('ref works for label variant too', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Divider ref={ref} label="With ref" />);
    expect(ref.current).not.toBeNull();
  });
});

// ── Edge case 7: custom className ─────────────────────────────────────────────

describe('Divider — custom className (edge case 7)', () => {
  it('merges a custom className onto the root element', () => {
    render(<Divider className="my-custom-class" />);
    expect(screen.getByRole('separator').className).toContain('my-custom-class');
  });

  it('retains base classes when custom className is added', () => {
    render(<Divider className="mt-4" />);
    const el = screen.getByRole('separator');
    expect(el.className).toContain('border-t');
    expect(el.className).toContain('mt-4');
  });
});
