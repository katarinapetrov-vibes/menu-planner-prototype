import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagIT(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Italy'}>
      <rect width="6.667" height="15" fill="#009246"/>
      <rect x="6.667" width="6.667" height="15" fill="#FFFFFF"/>
      <rect x="13.333" width="6.667" height="15" fill="#CE2B37"/>
    </FlagRoot>
  )
}
