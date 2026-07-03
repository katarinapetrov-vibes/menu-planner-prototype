import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagLU(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Luxembourg'}>
      <rect width="20" height="5" fill="#EF3340"/>
      <rect y="5" width="20" height="5" fill="#FFFFFF"/>
      <rect y="10" width="20" height="5" fill="#00A3E0"/>
    </FlagRoot>
  )
}
