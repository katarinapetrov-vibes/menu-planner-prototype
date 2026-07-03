/**
 * Scrollbar component — Vitest unit tests
 *
 * Covers:
 *  - Primary use case: renders children with default vertical orientation
 *  - Edge case 1: horizontal orientation sets correct overflow axes
 *  - Edge case 2: both orientation enables scroll on both axes
 *  - Edge case 3: scoped <style> tag is injected with correct token values
 *  - Edge case 4: dark theme injects dark-mode colour tokens
 *  - Edge case 5: custom className and style prop are forwarded
 *  - Edge case 6: forwardRef attaches to the wrapper div
 *  - Edge case 7: long / deeply nested children render without crash
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Scrollbar } from './scrollbar';
import { components } from '@/lib/tokens';

const sc = components.scrollbar;

// ── Primary use case ──────────────────────────────────────────────────────────

describe('Scrollbar — primary use case', () => {
  it('renders children inside the scrollable wrapper', () => {
    render(
      <Scrollbar>
        <p>Scroll content</p>
      </Scrollbar>,
    );
    expect(screen.getByText('Scroll content')).toBeTruthy();
  });

  it('defaults to vertical: overflowY=auto, overflowX=hidden', () => {
    const { container } = render(<Scrollbar><span>content</span></Scrollbar>);
    // The wrapper div is the last child of the fragment; style is inline
    const div = container.querySelector('div') as HTMLElement;
    expect(div.style.overflowY).toBe('auto');
    expect(div.style.overflowX).toBe('hidden');
  });

  it('injects a <style> tag alongside the wrapper div', () => {
    const { container } = render(<Scrollbar><span /></Scrollbar>);
    const styleTag = container.querySelector('style');
    expect(styleTag).not.toBeNull();
  });

  it('scoped class on the wrapper div matches the selector in the injected style', () => {
    const { container } = render(<Scrollbar><span /></Scrollbar>);
    const div = container.querySelector('div') as HTMLElement;
    const styleTag = container.querySelector('style') as HTMLStyleElement;
    // The div carries a class like "sb-r0"; the style should target that exact selector
    const scopedClass = Array.from(div.classList).find((c) => c.startsWith('sb-'));
    expect(scopedClass).toBeTruthy();
    expect(styleTag.textContent).toContain(`.${scopedClass}`);
  });
});

// ── Edge case 1: horizontal orientation ───────────────────────────────────────

describe('Scrollbar — horizontal orientation (edge case 1)', () => {
  it('sets overflowX=auto and overflowY=hidden', () => {
    const { container } = render(
      <Scrollbar orientation="horizontal"><span>h</span></Scrollbar>,
    );
    const div = container.querySelector('div') as HTMLElement;
    expect(div.style.overflowX).toBe('auto');
    expect(div.style.overflowY).toBe('hidden');
  });
});

// ── Edge case 2: both orientation ─────────────────────────────────────────────

describe('Scrollbar — both orientation (edge case 2)', () => {
  it('sets overflowX=auto and overflowY=auto', () => {
    const { container } = render(
      <Scrollbar orientation="both"><span>b</span></Scrollbar>,
    );
    const div = container.querySelector('div') as HTMLElement;
    expect(div.style.overflowX).toBe('auto');
    expect(div.style.overflowY).toBe('auto');
  });
});

// ── Edge case 3: light theme CSS tokens ───────────────────────────────────────

describe('Scrollbar — injected style tag (light theme) (edge case 3)', () => {
  it('includes the light track colour from tokens', () => {
    const { container } = render(<Scrollbar theme="light"><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain(sc.colour.light.track);
  });

  it('includes the light thumb colour from tokens', () => {
    const { container } = render(<Scrollbar theme="light"><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain(sc.colour.light.thumb);
  });

  it('includes the light thumb hover colour from tokens', () => {
    const { container } = render(<Scrollbar theme="light"><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain(sc.colour.light.thumbHover);
  });

  it('includes the scrollbar size token', () => {
    const { container } = render(<Scrollbar><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain(sc.size);
  });

  it('includes the border-radius token', () => {
    const { container } = render(<Scrollbar><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain(sc.borderRadius);
  });

  it('includes scrollbar-width: thin for Firefox', () => {
    const { container } = render(<Scrollbar><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain('scrollbar-width: thin');
  });
});

// ── Edge case 4: dark theme ───────────────────────────────────────────────────

describe('Scrollbar — dark theme (edge case 4)', () => {
  it('injects dark track colour instead of light track colour', () => {
    const { container } = render(<Scrollbar theme="dark"><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain(sc.colour.dark.track);
    expect(css).not.toContain(sc.colour.light.track);
  });

  it('injects dark thumb colour', () => {
    const { container } = render(<Scrollbar theme="dark"><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain(sc.colour.dark.thumb);
  });

  it('injects dark thumbHover colour', () => {
    const { container } = render(<Scrollbar theme="dark"><span /></Scrollbar>);
    const css = container.querySelector('style')!.textContent ?? '';
    expect(css).toContain(sc.colour.dark.thumbHover);
  });
});

// ── Edge case 5: className and style forwarding ───────────────────────────────

describe('Scrollbar — className and style forwarding (edge case 5)', () => {
  it('merges a custom className onto the wrapper div', () => {
    const { container } = render(
      <Scrollbar className="h-64 overflow-hidden"><span /></Scrollbar>,
    );
    const div = container.querySelector('div') as HTMLElement;
    expect(div.className).toContain('h-64');
    expect(div.className).toContain('overflow-hidden');
  });

  it('applies a custom style prop to the wrapper div', () => {
    const { container } = render(
      <Scrollbar style={{ maxHeight: '200px' }}><span /></Scrollbar>,
    );
    const div = container.querySelector('div') as HTMLElement;
    expect(div.style.maxHeight).toBe('200px');
  });

  it('custom style does not override the overflow values', () => {
    // overflowY from orientation logic should still be set correctly
    const { container } = render(
      <Scrollbar orientation="vertical" style={{ color: 'red' }}><span /></Scrollbar>,
    );
    const div = container.querySelector('div') as HTMLElement;
    expect(div.style.overflowY).toBe('auto');
  });
});

// ── Edge case 6: forwardRef ───────────────────────────────────────────────────

describe('Scrollbar — forwardRef (edge case 6)', () => {
  it('attaches a ref to the wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Scrollbar ref={ref}><span>ref test</span></Scrollbar>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('ref.current contains the rendered child', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Scrollbar ref={ref}><span id="inner">inner</span></Scrollbar>);
    expect(ref.current?.querySelector('#inner')).not.toBeNull();
  });
});

// ── Edge case 7: long / nested children ───────────────────────────────────────

describe('Scrollbar — extreme children (edge case 7)', () => {
  it('renders without crash when children is a long string', () => {
    const longText = 'x'.repeat(5000);
    render(<Scrollbar><p>{longText}</p></Scrollbar>);
    expect(screen.getByText(longText)).toBeTruthy();
  });

  it('renders without crash when children is deeply nested', () => {
    const nested = (
      <div>
        <div>
          <div>
            <span>deep</span>
          </div>
        </div>
      </div>
    );
    render(<Scrollbar>{nested}</Scrollbar>);
    expect(screen.getByText('deep')).toBeTruthy();
  });

  it('renders without crash when children is null', () => {
    // React permits null children; should not throw
    expect(() => render(<Scrollbar>{null}</Scrollbar>)).not.toThrow();
  });
});
