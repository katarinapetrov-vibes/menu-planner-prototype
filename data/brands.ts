export interface Brand {
  id: string
  name: string
  markets: string[]
}

export const brands: Brand[] = [
  { id: 'hellofresh',  name: 'HelloFresh',  markets: ['GB','DE','AT','CH','BE','NL','FR','SE','NO','DK','IT','ES','AU','NZ','US','CA'] },
  { id: 'greenchef',   name: 'Green Chef',  markets: ['GB','US','CA','DE','AT','CH','BE','NL','FR','SE','NO','DK'] },
  { id: 'chefplate',   name: 'Chef\'s Plate', markets: ['CA'] },
  { id: 'everyplate',  name: 'EveryPlate',  markets: ['US','AU'] },
  { id: 'factor',      name: 'Factor',      markets: ['US'] },
  { id: 'youfoodz',    name: 'Youfoodz',    markets: ['AU'] },
]

export const brandOptions = brands.map(b => ({
  label: b.name,
  value: b.id,
}))
