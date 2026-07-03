export interface Country {
  code: string
  name: string
  brand: string
  region: 'EU' | 'DACH' | 'APAC' | 'US'
}

export const countries: Country[] = [
  { code: 'GB', name: 'United Kingdom', brand: 'HelloFresh UK',  region: 'EU'   },
  { code: 'DE', name: 'Germany',        brand: 'HelloFresh DE',  region: 'DACH' },
  { code: 'AT', name: 'Austria',        brand: 'HelloFresh AT',  region: 'DACH' },
  { code: 'CH', name: 'Switzerland',    brand: 'HelloFresh CH',  region: 'DACH' },
  { code: 'BE', name: 'Belgium',        brand: 'HelloFresh BE',  region: 'EU'   },
  { code: 'NL', name: 'Netherlands',    brand: 'HelloFresh NL',  region: 'EU'   },
  { code: 'FR', name: 'France',         brand: 'HelloFresh FR',  region: 'EU'   },
  { code: 'SE', name: 'Sweden',         brand: 'HelloFresh SE',  region: 'EU'   },
  { code: 'NO', name: 'Norway',         brand: 'HelloFresh NO',  region: 'EU'   },
  { code: 'DK', name: 'Denmark',        brand: 'HelloFresh DK',  region: 'EU'   },
  { code: 'IT', name: 'Italy',          brand: 'HelloFresh IT',  region: 'EU'   },
  { code: 'ES', name: 'Spain',          brand: 'HelloFresh ES',  region: 'EU'   },
  { code: 'AU', name: 'Australia',      brand: 'HelloFresh AU',  region: 'APAC' },
  { code: 'NZ', name: 'New Zealand',    brand: 'HelloFresh NZ',  region: 'APAC' },
  { code: 'US', name: 'United States',  brand: 'HelloFresh US',  region: 'US'   },
  { code: 'CA', name: 'Canada',         brand: 'HelloFresh CA',  region: 'US'   },
]

export const countryOptions = countries.map(c => ({
  label: c.brand,
  value: c.code,
}))
