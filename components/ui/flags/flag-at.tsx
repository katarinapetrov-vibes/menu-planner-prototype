import { FlagRoot, FlagIconProps } from './flag-root'
export function FlagAT(p: FlagIconProps) {
  return (
    <FlagRoot {...p} aria-label={p['aria-label'] ?? 'Austria'}>
      <rect width="20" height="5" fill="#ED2939"/>
      <rect y="5" width="20" height="5" fill="#FFFFFF"/>
      <rect y="10" width="20" height="5" fill="#ED2939"/>
    </FlagRoot>
  )
}
