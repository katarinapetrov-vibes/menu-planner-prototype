/**
 * Button component — Vitest unit tests
 *
 * Covers:
 *  - Primary use case: renders with default props
 *  - Edge case 1: disabled state (HTML attr + aria)
 *  - Edge case 2: loading state disables button and shows spinner
 *  - Edge case 3: icon-only (no children) renders without crash
 *  - Edge case 4: long text is contained via whitespace-nowrap
 *  - Edge case 5: fullWidth applies w-full class
 *  - Edge case 6: onClick is not fired when disabled
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button — primary use case', () => {
  it('renders with correct text and default element type', () => {
    render(<Button>Save changes</Button>);
    const btn = screen.getByRole('button', { name: /save changes/i });
    expect(btn).toBeTruthy();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('forwards a ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('passes extra HTML attributes to the button', () => {
    render(<Button data-testid="my-btn" aria-label="custom label">X</Button>);
    const btn = screen.getByTestId('my-btn');
    expect(btn.getAttribute('aria-label')).toBe('custom label');
  });
});

describe('Button — disabled state (edge case 1)', () => {
  it('sets the disabled HTML attribute when disabled=true', () => {
    render(<Button disabled>Delete</Button>);
    const btn = screen.getByRole('button', { name: /delete/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('does not fire onClick when disabled', () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Delete</Button>);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('applies disabled cursor class', () => {
    render(<Button disabled>Delete</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('cursor-not-allowed');
  });
});

describe('Button — loading state (edge case 2)', () => {
  it('sets disabled attribute when loading=true', () => {
    render(<Button loading>Saving…</Button>);
    const btn = screen.getByRole('button');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders the loading spinner SVG when loading=true', () => {
    const { container } = render(<Button loading>Saving…</Button>);
    // LoadingSpinner renders an SVG with animate-spin class
    const spinner = container.querySelector('svg.animate-spin');
    expect(spinner).not.toBeNull();
  });

  it('hides trailing icon while loading', () => {
    const { container } = render(
      <Button loading showTrailingIcon trailingIcon={<span data-testid="trailing" />}>
        Saving
      </Button>
    );
    expect(container.querySelector('[data-testid="trailing"]')).toBeNull();
  });
});

describe('Button — icon-only / no children (edge case 3)', () => {
  it('renders without crashing when no children are provided', () => {
    // showLeadingIcon=true gives it visible content so it has an accessible role
    const { container } = render(<Button showLeadingIcon aria-label="Close" />);
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
  });

  it('does not render the text span when children is undefined', () => {
    const { container } = render(<Button showLeadingIcon aria-label="Close" />);
    // The whitespace-nowrap span must not exist (it's conditionally rendered)
    const textSpan = container.querySelector('span.whitespace-nowrap');
    expect(textSpan).toBeNull();
  });
});

describe('Button — long text (edge case 4)', () => {
  it('applies truncate class so overflowing text is clipped with an ellipsis', () => {
    const longLabel = 'A'.repeat(200);
    render(<Button>{longLabel}</Button>);
    // Bug 7 fix changed whitespace-nowrap → truncate (overflow-hidden + whitespace-nowrap + text-ellipsis)
    const span = screen.getByRole('button').querySelector('span.truncate');
    expect(span).not.toBeNull();
  });
});

describe('Button — fullWidth (edge case 5)', () => {
  it('applies w-full when fullWidth=true', () => {
    render(<Button fullWidth>Submit</Button>);
    expect(screen.getByRole('button').className).toContain('w-full');
  });

  it('does not apply w-full by default', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button').className).not.toContain('w-full');
  });
});

describe('Button — aria-busy (edge case 6)', () => {
  it('sets aria-busy="true" when loading=true', () => {
    render(<Button loading>Saving…</Button>);
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  });

  it('does not set aria-busy when not loading', () => {
    render(<Button>Submit</Button>);
    // aria-busy should be absent or not "true"
    const val = screen.getByRole('button').getAttribute('aria-busy');
    expect(val).toBeNull();
  });
});

describe('Button — onClick blocked when loading (edge case 7)', () => {
  it('does not fire onClick when loading=true', () => {
    const handler = vi.fn();
    render(<Button loading onClick={handler}>Saving…</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('Button — type attribute (edge case 8)', () => {
  it('always renders type="button" to prevent accidental form submission', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });
});

describe('Button — dual icons (edge case 9)', () => {
  it('renders both leading and trailing icon spans simultaneously', () => {
    const { container } = render(
      <Button showLeadingIcon showTrailingIcon>Save</Button>
    );
    // Both icon wrapper spans should exist alongside the text span
    const spans = container.querySelectorAll('button > span');
    // leading icon span + text span + trailing icon span = 3
    expect(spans.length).toBe(3);
  });

  it('renders a custom leadingIcon node instead of the default', () => {
    render(
      <Button showLeadingIcon leadingIcon={<span data-testid="custom-lead" />}>Go</Button>
    );
    expect(screen.getByTestId('custom-lead')).toBeTruthy();
  });

  it('renders a custom trailingIcon node instead of the default', () => {
    render(
      <Button showTrailingIcon trailingIcon={<span data-testid="custom-trail" />}>Go</Button>
    );
    expect(screen.getByTestId('custom-trail')).toBeTruthy();
  });
});

describe('Button — theme prop (edge case 10)', () => {
  it('renders without error on dark theme', () => {
    render(<Button theme="dark" variant="fill" color="positive">Dark</Button>);
    expect(screen.getByRole('button', { name: /dark/i })).toBeTruthy();
  });

  it('applies different class string for dark vs light theme', () => {
    const { rerender } = render(<Button theme="light" color="positive">X</Button>);
    const lightCls = screen.getByRole('button').className;
    rerender(<Button theme="dark" color="positive">X</Button>);
    const darkCls = screen.getByRole('button').className;
    expect(lightCls).not.toBe(darkCls);
  });
});

describe('Button — variant × color class differentiation (edge case 11)', () => {
  it('fill and outline variants produce different class strings', () => {
    const { rerender } = render(<Button variant="fill" color="positive">X</Button>);
    const fillCls = screen.getByRole('button').className;
    rerender(<Button variant="outline" color="positive">X</Button>);
    const outlineCls = screen.getByRole('button').className;
    expect(fillCls).not.toBe(outlineCls);
  });

  it('positive and negative colors produce different class strings', () => {
    const { rerender } = render(<Button variant="fill" color="positive">X</Button>);
    const posCls = screen.getByRole('button').className;
    rerender(<Button variant="fill" color="negative">X</Button>);
    const negCls = screen.getByRole('button').className;
    expect(posCls).not.toBe(negCls);
  });
});
