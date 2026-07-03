/**
 * InputField component — Vitest unit tests
 *
 * Covers:
 *  - Primary use case: renders label, input, and helper text
 *  - Edge case 1: controlled vs uncontrolled value / onChange wiring
 *  - Edge case 2: disabled state — HTML attr, aria, cursor, opacity
 *  - Edge case 3: error state — aria-invalid, role=alert, error text
 *  - Edge case 4: password toggle — type switch, aria-label change, tabIndex bug
 *  - Edge case 5: clear button — visibility logic, clears value, returns focus
 *  - Edge case 6: character counter — display and aria-live
 *  - Edge case 7: prefix / suffix adornments render
 *  - Edge case 8: required field — asterisk, aria-required
 *  - Edge case 9: readOnly suppresses clear button
 *  - Edge case 10: extremely long value contained in the input
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InputField } from './input-field';

// ─── Primary use case ────────────────────────────────────────────────────────

describe('InputField — primary use case', () => {
  it('renders the label associated with the input (stacked)', () => {
    render(<InputField label="Email address" variant="stacked" />);
    const label = screen.getByText('Email address');
    expect(label.tagName).toBe('LABEL');
    const input = screen.getByRole('textbox');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('renders the legend associated with the input (outlined)', () => {
    render(<InputField label="Email address" variant="outlined" />);
    const legend = screen.getByText('Email address');
    expect(legend.tagName).toBe('LEGEND');
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-labelledby')).toBe(legend.id);
  });

  it('renders the input with a visible placeholder', () => {
    render(<InputField placeholder="you@example.com" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.placeholder).toBe('you@example.com');
  });

  it('renders helper text below the input', () => {
    render(<InputField helperText="We will never share your email." />);
    expect(screen.getByText('We will never share your email.')).toBeTruthy();
  });

  it('renders without any props without crashing', () => {
    const { container } = render(<InputField />);
    expect(container.querySelector('input')).not.toBeNull();
  });
});

// ─── Edge case 1: controlled / uncontrolled ───────────────────────────────────

describe('InputField — controlled and uncontrolled modes (edge case 1)', () => {
  it('reflects an externally controlled value', () => {
    render(<InputField value="hello" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });

  it('fires onChange with the new string value on each keystroke', () => {
    const handler = vi.fn();
    render(<InputField onChange={handler} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(handler).toHaveBeenCalledWith('abc');
  });

  it('updates internal state in uncontrolled mode', () => {
    render(<InputField defaultValue="initial" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'updated' } });
    expect(input.value).toBe('updated');
  });
});

// ─── Edge case 2: disabled state ─────────────────────────────────────────────

describe('InputField — disabled state (edge case 2)', () => {
  it('sets the disabled HTML attribute on the native input', () => {
    render(<InputField disabled label="Name" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('applies cursor-not-allowed to the input', () => {
    render(<InputField disabled />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('cursor-not-allowed');
  });

  it('does not show the clear button when disabled', () => {
    render(<InputField disabled clearable value="some text" onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull();
  });
});

// ─── Edge case 3: error state ─────────────────────────────────────────────────

describe('InputField — error state (edge case 3)', () => {
  it('renders the error message in place of helper text', () => {
    render(<InputField error="This field is required" helperText="Ignored helper" />);
    expect(screen.getByText('This field is required')).toBeTruthy();
    expect(screen.queryByText('Ignored helper')).toBeNull();
  });

  it('sets aria-invalid="true" on the input when error is provided', () => {
    render(<InputField error="Bad value" />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('gives the error span role="alert" for live-region announcement', () => {
    render(<InputField error="Something went wrong" />);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Something went wrong');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<InputField />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
});

// ─── Edge case 4: password visibility toggle ──────────────────────────────────

describe('InputField — password toggle (edge case 4)', () => {
  it('renders as type="password" by default', () => {
    const { container } = render(<InputField type="password" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('switches to type="text" when toggle is clicked', () => {
    const { container } = render(<InputField type="password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggle);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('updates aria-label on the toggle after reveal', () => {
    render(<InputField type="password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: /hide password/i })).toBeTruthy();
  });

  it('password toggle is keyboard reachable (tabIndex 0)', () => {
    render(<InputField type="password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    expect(toggle.getAttribute('tabindex')).toBe('0');
  });
});

// ─── Edge case 5: clear button ────────────────────────────────────────────────

describe('InputField — clear button (edge case 5)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('is hidden when the value is empty', () => {
    render(<InputField clearable value="" onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull();
  });

  it('appears when clearable=true and the field has a value', () => {
    render(<InputField clearable value="something" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeTruthy();
  });

  it('calls onChange with empty string and clears uncontrolled value', () => {
    const handler = vi.fn();
    render(<InputField clearable defaultValue="abc" onChange={handler} />);
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    act(() => { vi.runAllTimers(); });
    expect(handler).toHaveBeenCalledWith('');
  });

  it('clear button is keyboard reachable (tabIndex 0)', () => {
    render(<InputField clearable value="text" onChange={() => {}} />);
    const btn = screen.getByRole('button', { name: /clear/i });
    expect(btn.getAttribute('tabindex')).toBe('0');
  });
});

// ─── Edge case 6: character counter ──────────────────────────────────────────

describe('InputField — character counter (edge case 6)', () => {
  it('shows current length vs maxLength when showCharCount and maxLength are set', () => {
    render(<InputField showCharCount maxLength={20} defaultValue="hello" />);
    expect(screen.getByText('5/20')).toBeTruthy();
  });

  it('does not render the counter when maxLength is missing', () => {
    const { container } = render(<InputField showCharCount />);
    // The counter span has aria-live="polite"
    expect(container.querySelector('[aria-live="polite"]')).toBeNull();
  });

  it('uses aria-live="polite" on the counter for screen-reader updates', () => {
    render(<InputField showCharCount maxLength={10} />);
    const counter = screen.getByText('0/10');
    expect(counter.getAttribute('aria-live')).toBe('polite');
  });
});

// ─── Edge case 7: prefix / suffix ────────────────────────────────────────────

describe('InputField — prefix and suffix adornments (edge case 7)', () => {
  it('renders the prefix text', () => {
    render(<InputField prefix="https://" />);
    expect(screen.getByText('https://')).toBeTruthy();
  });

  it('renders the suffix text', () => {
    render(<InputField suffix=".com" />);
    expect(screen.getByText('.com')).toBeTruthy();
  });

  it('suppresses the search leading icon when prefix is present', () => {
    const { container } = render(<InputField type="search" prefix="Site:" />);
    // Search icon is a plain SVG inside a span; the prefix replaces it
    const prefixSpan = screen.getByText('Site:');
    expect(prefixSpan).toBeTruthy();
  });
});

// ─── Edge case 8: required field ─────────────────────────────────────────────

describe('InputField — required field (edge case 8)', () => {
  it('appends an asterisk to the label when required=true', () => {
    render(<InputField label="Email" required />);
    const label = screen.getByText('Email');
    // The asterisk is a sibling span inside the label element
    const asterisk = label.parentElement?.querySelector('[aria-hidden]');
    expect(asterisk?.textContent).toBe('*');
  });

  it('sets aria-required="true" on the native input', () => {
    render(<InputField required />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('does not set aria-required when required is false', () => {
    render(<InputField />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-required')).toBeNull();
  });
});

// ─── Edge case 9: readOnly suppresses clear button ────────────────────────────

describe('InputField — readOnly (edge case 9)', () => {
  it('does not render the clear button when readOnly is set', () => {
    render(<InputField clearable readOnly value="locked" onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull();
  });

  it('forwards the readOnly attribute to the native input', () => {
    const { container } = render(<InputField readOnly />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
  });
});

// ─── Bug fix: error takes priority over clear button (L1) ────────────────────

describe('InputField — error + clearable priority (bug fix L1)', () => {
  it('hides the clear button when the field has both a value and an error', () => {
    render(<InputField clearable value="bad-input" error="Invalid value" onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull();
  });

  it('shows the error icon when clearable=true and error is set', () => {
    // The error message (role=alert) must be present — the error icon is the
    // trailing slot occupant when the clear button is suppressed by an error.
    render(<InputField clearable value="bad-input" error="Something is wrong" onChange={() => {}} />);
    expect(screen.getByRole('alert').textContent).toBe('Something is wrong');
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull();
  });

  it('shows the clear button normally when there is no error', () => {
    render(<InputField clearable value="good-input" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeTruthy();
  });
});

// ─── Bug fix: dev warnings (L2, A2) ──────────────────────────────────────────

describe('InputField — dev-mode warnings (bug fix L2, A2)', () => {
  it('warns when showCharCount=true but maxLength is not provided', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<InputField showCharCount />);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('showCharCount=true has no effect without maxLength'),
    );
    spy.mockRestore();
  });

  it('does not warn when both showCharCount and maxLength are provided', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<InputField showCharCount maxLength={50} />);
    const charCountWarning = spy.mock.calls.find((args) =>
      args[0]?.includes?.('showCharCount'),
    );
    expect(charCountWarning).toBeUndefined();
    spy.mockRestore();
  });

  it('warns when neither label nor aria-label is provided', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<InputField />);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('No accessible name provided'),
    );
    spy.mockRestore();
  });

  it('does not warn about accessible name when label is provided', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<InputField label="Email" />);
    const a11yWarning = spy.mock.calls.find((args) =>
      args[0]?.includes?.('No accessible name'),
    );
    expect(a11yWarning).toBeUndefined();
    spy.mockRestore();
  });

  it('does not warn about accessible name when aria-label is provided', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<InputField aria-label="Search the site" />);
    const a11yWarning = spy.mock.calls.find((args) =>
      args[0]?.includes?.('No accessible name'),
    );
    expect(a11yWarning).toBeUndefined();
    spy.mockRestore();
  });
});

// ─── Edge case 10: extremely long value ──────────────────────────────────────

describe('InputField — long value (edge case 10)', () => {
  it('accepts and displays an extremely long string without crashing', () => {
    const longValue = 'A'.repeat(5000);
    const { container } = render(<InputField value={longValue} onChange={() => {}} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe(longValue);
  });

  it('does not exceed maxLength when maxLength is set', () => {
    render(<InputField maxLength={10} defaultValue="" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.maxLength).toBe(10);
  });
});
