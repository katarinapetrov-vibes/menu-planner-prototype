'use client';

import React from 'react';
import { cn } from './utils';

// ─── Types ────────────────────────────────────────────────────────────────────
// Countries sourced from Figma: bBJVhJdmpM5E1YczJ8R4Vv / node 31418:3229

export const COUNTRY_CODES = [
  'AU', 'AT', 'BE', 'CA', 'DK',
  'FR', 'DE', 'IE', 'IT', 'JP',
  'LU', 'NL', 'NZ', 'NO', 'ES',
  'SE', 'CH', 'GB', 'US',
] as const;

export type CountryCode = typeof COUNTRY_CODES[number];

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  AU: 'Australia',
  AT: 'Austria',
  BE: 'Belgium',
  CA: 'Canada',
  DK: 'Denmark',
  FR: 'France',
  DE: 'Germany',
  IE: 'Ireland',
  IT: 'Italy',
  JP: 'Japan',
  LU: 'Luxembourg',
  NL: 'Netherlands',
  NZ: 'New Zealand',
  NO: 'Norway',
  ES: 'Spain',
  SE: 'Sweden',
  CH: 'Switzerland',
  GB: 'United Kingdom',
  US: 'United States',
};

export type FlagSize = 'S' | 'M' | 'L' | 'XL';

export interface FlagProps {
  /** ISO 3166-1 alpha-2 country code */
  country: CountryCode;
  /** Size variant — maps to Figma size tokens S/M/L/XL */
  size?: FlagSize;
  /** Override the accessible label (defaults to country name) */
  label?: string;
  className?: string;
}

// ─── Size tokens ──────────────────────────────────────────────────────────────
// Heights: S=12, M=24, L=48, XL=96 — sourced from Figma frame 31430:2014
// Border-radius scales proportionally with size

const SIZE_MAP: Record<FlagSize, {
  height:  number;
  radius:  string;
}> = {
  S:  { height: 12, radius: 'rounded-[1px]'  },
  M:  { height: 24, radius: 'rounded-[2px]'  },
  L:  { height: 48, radius: 'rounded'         }, // 4px
  XL: { height: 96, radius: 'rounded-lg'      }, // 8px
};

// Switzerland uses a 1:1 square flag (all others are 3:2)
const SQUARE_FLAGS = new Set<CountryCode>(['CH']);

// ─── Component ────────────────────────────────────────────────────────────────

export function Flag({ country, size = 'M', label, className }: FlagProps) {
  const { height, radius } = SIZE_MAP[size];
  const isSquare            = SQUARE_FLAGS.has(country);
  const width               = isSquare ? height : Math.round(height * 1.5);
  const countryName         = COUNTRY_NAMES[country];
  const ariaLabel           = label ?? countryName;
  const code                = country.toLowerCase();

  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={ariaLabel}
      width={width}
      height={height}
      className={cn(
        'inline-block object-cover shrink-0',
        'border border-black/[0.06]', // subtle outline for light-coloured flags (e.g. Japan)
        radius,
        className,
      )}
      style={{ width, height }}
      loading="lazy"
      decoding="async"
    />
  );
}

export default Flag;
